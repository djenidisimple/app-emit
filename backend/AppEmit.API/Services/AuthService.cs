using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppEmit.API.Data;
using Microsoft.EntityFrameworkCore;
using AppEmit.API.DTOs.Auth;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;
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
            var emailNormalise = dto.Email.ToLower().Trim();
            var existe = await _context.Utilisateurs
                .AnyAsync(u => u.Email == emailNormalise);
            if (existe)
                throw new Exceptions.ConflictException("Un compte avec cet email existe déjà.");

            var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Nom == dto.Role);
            if (roleEntity == null)
            {
                throw new Exceptions.ValidationException($"Le rôle '{dto.Role}' n'existe pas.");
            }

            var utilisateur = new Utilisateur
            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Email = emailNormalise,
                MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
                Matricule = dto.Matricule,
                NiveauId = dto.NiveauId,
                Role = dto.Role,
                Roles = new List<Role> { roleEntity }
            };

            _context.Utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();

            return GenererToken(utilisateur);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var emailNormalise = dto.Email.ToLower().Trim();
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == emailNormalise);

            if (utilisateur == null) {
                Console.WriteLine($"[LOGIN FAIL] Utilisateur non trouvé pour l'email: {dto.Email}");
                throw new Exceptions.UnauthorizedException("Email ou mot de passe incorrect.");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.MotDePasse, utilisateur.MotDePasseHash)) {
                Console.WriteLine($"[LOGIN FAIL] Mot de passe incorrect pour l'email: {dto.Email}");
                throw new Exceptions.UnauthorizedException("Email ou mot de passe incorrect.");
            }

            return GenererToken(utilisateur);
        }

        private AuthResponseDto GenererToken(Utilisateur utilisateur)
        {
            if (utilisateur == null)
                throw new InvalidOperationException("Les données utilisateur sont invalides.");

            // Sécurité sur la configuration - utiliser des valeurs par défaut pour éviter les erreurs d'environnement
            var keyStr = _config["Jwt:Key"] 
                ?? Environment.GetEnvironmentVariable("JWT_KEY")
                ?? "test-jwt-key-for-testing-only";

            var issuer = _config["Jwt:Issuer"] 
                ?? Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? "AppEmit.API";

            var audience = _config["Jwt:Audience"] 
                ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? "AppEmit.Frontend";

            var cle = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var credentials = new SigningCredentials(cle, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddHours(8);

            // Sécurité sur les données utilisateur
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
                new Claim(ClaimTypes.Email, utilisateur.Email ?? "inconnu@emit.mg"),
                new Claim("Nom", utilisateur.Nom ?? ""),
                new Claim("Prenom", utilisateur.Prenom ?? ""),
                new Claim("Matricule", utilisateur.Matricule ?? ""),
                new Claim("NiveauId", utilisateur.NiveauId?.ToString() ?? "")
            };

            // Sécurité sur les rôles et permissions
            if (utilisateur.Roles != null)
            {
                foreach (var role in utilisateur.Roles)
                {
                    if (!string.IsNullOrEmpty(role.Nom))
                    {
                        claims.Add(new Claim(ClaimTypes.Role, role.Nom));
                    }
                    
                    if (role.Permissions != null)
                    {
                        foreach (var perm in role.Permissions)
                        {
                            if (!string.IsNullOrEmpty(perm.Nom))
                            {
                                claims.Add(new Claim("Permission", perm.Nom));
                            }
                        }
                    }
                }
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new AuthResponseDto
            {
                Token = tokenString,
                Id = utilisateur.Id,
                Nom = utilisateur.Nom ?? "",
                Prenom = utilisateur.Prenom ?? "",
                Email = utilisateur.Email ?? "",
                Role = utilisateur.Role,
                Roles = utilisateur.Roles?.Select(r => r.Nom).ToList() ?? new List<string>(),
                Matricule = utilisateur.Matricule,
                NiveauId = utilisateur.NiveauId,
                Expiration = expiration
            };
        }
    }
}
