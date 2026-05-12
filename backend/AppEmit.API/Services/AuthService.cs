using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppEmit.API.Data;
using Microsoft.EntityFrameworkCore;
using AppEmit.API.DTOs.Auth;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;          // ← namespace de Brunel
using Microsoft.IdentityModel.Tokens;

namespace AppEmit.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existe = await _context.Utilisateurs
                .AnyAsync(u => u.Email == dto.Email);
            if (existe)
                throw new Exceptions.ConflictException("Un compte avec cet email existe déjà.");

            var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Nom == dto.Role);
            if (roleEntity == null)
            {
                // Optionnel: Créer le rôle s'il n'existe pas ou lever une erreur
                roleEntity = new Role { Nom = dto.Role };
                _context.Roles.Add(roleEntity);
            }

            var utilisateur = new Utilisateur
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Email = dto.Email,
                MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
                Matricule = dto.Matricule,
                Roles = new List<Role> { roleEntity }
            };

            _context.Utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();

            return GenererToken(utilisateur);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var utilisateur = await _context.Utilisateurs
                .Include(u => u.Roles)
                    .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (utilisateur == null ||
                !BCrypt.Net.BCrypt.Verify(dto.MotDePasse, utilisateur.MotDePasseHash))
                throw new Exceptions.UnauthorizedException("Email ou mot de passe incorrect.");

            return GenererToken(utilisateur);
        }

        private AuthResponseDto GenererToken(Utilisateur utilisateur)
        {
            var cle = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(
                cle, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddHours(8);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
                new Claim(ClaimTypes.Email, utilisateur.Email),
                new Claim("Matricule", utilisateur.Matricule)
            };

            // Add Roles
            foreach (var role in utilisateur.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Nom));
                
                // Add Permissions from Role
                foreach (var perm in role.Permissions)
                {
                    claims.Add(new Claim("Permission", perm.Nom));
                }
            }

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Nom = utilisateur.Nom,
                Prenom = utilisateur.Prenom,
                Email = utilisateur.Email,
                Roles = utilisateur.Roles.Select(r => r.Nom).ToList(),
                Expiration = expiration
            };
        }
    }
}
