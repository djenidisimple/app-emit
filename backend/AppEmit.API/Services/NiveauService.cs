using AppEmit.API.DTOs.Niveau;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services
{
    public class NiveauService : INiveauService
    {
        private readonly IGenericRepository<Niveau> _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<NiveauService> _logger;

        public NiveauService(IGenericRepository<Niveau> repository, IMapper mapper, ILogger<NiveauService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<NiveauDto>> GetAllAsync()
        {
            var niveaux = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<NiveauDto>>(niveaux);
        }

        public async Task<NiveauDto?> GetByIdAsync(int id)
        {
            var niveau = await _repository.GetByIdAsync(id);
            return niveau == null ? null : _mapper.Map<NiveauDto>(niveau);
        }

        public async Task<NiveauDto> CreateAsync(NiveauCreateDto dto)
        {
            var entity = _mapper.Map<Niveau>(dto);
            var created = await _repository.AddAsync(entity);
            _logger.LogInformation("Niveau {Code} créé.", created.Code);
            return _mapper.Map<NiveauDto>(created);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var niveau = await _repository.GetByIdAsync(id);
            if (niveau == null) return false;
            await _repository.DeleteAsync(niveau);
            _logger.LogInformation("Niveau {Id} supprimé.", id);
            return true;
        }
    }
}
