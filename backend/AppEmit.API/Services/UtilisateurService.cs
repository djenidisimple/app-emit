using AppEmit.API.DTOs.Utilisateur;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace AppEmit.API.Services
{
    public class UtilisateurService : IUtilisateurService
    {
        private readonly IUtilisateurRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<UtilisateurService> _logger;

        public UtilisateurService(IUtilisateurRepository repository, IMapper mapper, ILogger<UtilisateurService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<UtilisateurDto>> GetAllAsync()
        {
            var utilisateurs = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<UtilisateurDto>>(utilisateurs);
        }

        public async Task<IEnumerable<UtilisateurDto>> GetByRoleAsync(string role)
        {
            var utilisateurs = await _repository.GetByRoleAsync(role);
            return _mapper.Map<IEnumerable<UtilisateurDto>>(utilisateurs);
        }

        public async Task<UtilisateurDto?> GetByIdAsync(int id)
        {
            var utilisateur = await _repository.GetByIdAsync(id);
            return utilisateur == null ? null : _mapper.Map<UtilisateurDto>(utilisateur);
        }

        public async Task<UtilisateurCreatedDto> CreateAsync(UtilisateurCreateDto dto)
        {
            var motDePasse = dto.MotDePasse;
            if (string.IsNullOrWhiteSpace(motDePasse))
            {
                motDePasse = GeneratePassword(8);
            }

            var entity = _mapper.Map<Utilisateur>(dto);
            entity.MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(motDePasse);
            var created = await _repository.AddAsync(entity);
            _logger.LogInformation("Utilisateur {Id} créé.", created.Id);

            var result = _mapper.Map<UtilisateurCreatedDto>(created);
            result.MotDePasse = motDePasse;
            return result;
        }

        private static string GeneratePassword(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
            var data = new byte[length];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(data);
            }
            return new string(data.Select(b => chars[b % chars.Length]).ToArray());
        }

        public async Task<UtilisateurDto?> UpdateAsync(int id, UtilisateurUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) throw new NotFoundException("Utilisateur non trouvé.");
            _mapper.Map(dto, existing);
            await _repository.UpdateAsync(existing);
            _logger.LogInformation("Utilisateur {Id} mis à jour.", id);
            return _mapper.Map<UtilisateurDto>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            await _repository.DeleteAsync(existing);
            _logger.LogInformation("Utilisateur {Id} supprimé.", id);
            return true;
        }
    }
}
