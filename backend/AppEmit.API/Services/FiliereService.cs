using AppEmit.API.DTOs.Filiere;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services
{
    public class FiliereService : IFiliereService
    {
        private readonly IGenericRepository<Filiere> _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<FiliereService> _logger;

        public FiliereService(IGenericRepository<Filiere> repository, IMapper mapper, ILogger<FiliereService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<FiliereDto>> GetAllAsync()
        {
            var filieres = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<FiliereDto>>(filieres);
        }

        public async Task<FiliereDto?> GetByIdAsync(int id)
        {
            var filiere = await _repository.GetByIdAsync(id);
            return filiere == null ? null : _mapper.Map<FiliereDto>(filiere);
        }

        public async Task<FiliereDto> CreateAsync(FiliereCreateDto dto)
        {
            var entity = _mapper.Map<Filiere>(dto);
            var created = await _repository.AddAsync(entity);
            _logger.LogInformation("Filière {Nom} créée.", created.Nom);
            return _mapper.Map<FiliereDto>(created);
        }

        public async Task<FiliereDto?> UpdateAsync(int id, FiliereCreateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            _mapper.Map(dto, existing);
            await _repository.UpdateAsync(existing);
            _logger.LogInformation("Filière {Id} mise à jour : {Nom}", existing.Id, existing.Nom);
            return _mapper.Map<FiliereDto>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var filiere = await _repository.GetByIdAsync(id);
            if (filiere == null) return false;
            await _repository.DeleteAsync(filiere);
            _logger.LogInformation("Filière {Id} supprimée.", id);
            return true;
        }
    }
}