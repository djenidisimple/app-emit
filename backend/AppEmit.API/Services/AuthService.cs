using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppEmit.API.DTOs.Auth;
using AppEmit.API.Interfaces;
using AppEmit.Entities;          // ← namespace de Brunel
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AppEmit.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly DbContext _context;
        private readonly IConfiguration _config;

        public AuthService(DbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var utilisateurs = _context.Set<Utilisateur>();

            var existe = await utilisateurs
                .AnyAsync(u => u.Email == dto.Email);
            if (existe)
                throw new Exception("Un compte avec cet email existe déjà.");

            var utilisateur = new Utilisateur
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Email = dto.Email,
                MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
                Role = dto.Role,
                Matricule = dto.Matricule
            };

            utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();

            return GenererToken(utilisateur);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var utilisateur = await _context.Set<Utilisateur>()
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (utilisateur == null ||
                !BCrypt.Net.BCrypt.Verify(dto.MotDePasse, utilisateur.MotDePasseHash))
                throw new Exception("Email ou mot de passe incorrect.");

            return GenererToken(utilisateur);
        }

        private AuthResponseDto GenererToken(Utilisateur utilisateur)
        {
            var cle = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(
                cle, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddHours(8);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
                new Claim(ClaimTypes.Email, utilisateur.Email),
                new Claim(ClaimTypes.Role, utilisateur.Role),
                new Claim("Matricule", utilisateur.Matricule)
            };

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
                Role = utilisateur.Role,
                Expiration = expiration
            };
        }
    }
}