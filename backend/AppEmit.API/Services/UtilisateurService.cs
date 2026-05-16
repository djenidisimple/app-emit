using AppEmit.API.DTOs.Utilisateur;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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

        public async Task<UtilisateurDto?> GetByIdAsync(int id)
        {
            var utilisateur = await _repository.GetByIdAsync(id);
            return utilisateur == null ? null : _mapper.Map<UtilisateurDto>(utilisateur);
        }

        public async Task<UtilisateurDto> CreateAsync(UtilisateurCreateDto dto)
        {
            var entity = _mapper.Map<Utilisateur>(dto);
            entity.MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse);
            var created = await _repository.AddAsync(entity);
            _logger.LogInformation("Utilisateur {Id} créé.", created.Id);
            return _mapper.Map<UtilisateurDto>(created);
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
