using AutoMapper;
using AppEmit.API.DTOs.SeanceCours;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services
{
    public class SeanceCoursService : ISeanceCoursService
    {
        private readonly ISeanceCoursRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<SeanceCoursService> _logger;

        public SeanceCoursService(ISeanceCoursRepository repository, IMapper mapper, ILogger<SeanceCoursService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<SeanceCoursReadDto?> GetByIdAsync(int id)
        {
            var seance = await _repository.GetSeanceByIdAsync(id);
            return seance == null ? null : _mapper.Map<SeanceCoursReadDto>(seance);
        }

        public async Task<SeanceCoursReadDto?> UpdateAsync(int id, SeanceCoursUpdateDto dto)
        {
            var seance = await _repository.GetSeanceByIdAsync(id);
            if (seance == null) throw new NotFoundException("Séance non trouvée.");

            if (dto.SalleId != 0) seance.SalleId = dto.SalleId;
            if (dto.CreneauId != 0) seance.CreneauId = dto.CreneauId;
            if (!string.IsNullOrEmpty(dto.CouleurAffichage)) seance.CouleurAffichage = dto.CouleurAffichage;
            seance.EstTerminee = dto.EstTermine;

            await _repository.UpdateAsync(seance);
            _logger.LogInformation("Séance {Id} mise à jour.", id);

            return _mapper.Map<SeanceCoursReadDto>(seance);
        }

        public async Task<bool> MarquerTermineeAsync(int id)
        {
            var seance = await _repository.GetSeanceByIdAsync(id);
            if (seance == null) throw new NotFoundException("Séance non trouvée.");

            seance.EstTerminee = true;
            await _repository.UpdateAsync(seance);
            _logger.LogInformation("Séance {Id} marquée comme terminée.", id);

            return true;
        }
    }
}
