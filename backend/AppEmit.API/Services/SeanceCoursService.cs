using AutoMapper;
using AppEmit.API.Data;
using AppEmit.API.DTOs.SeanceCours;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services
{
    public class SeanceCoursService : ISeanceCoursService
    {
        private readonly ISeanceCoursRepository _repository;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<SeanceCoursService> _logger;

        public SeanceCoursService(
            ISeanceCoursRepository repository,
            AppDbContext context,
            IMapper mapper,
            ILogger<SeanceCoursService> logger)
        {
            _repository = repository;
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<SeanceCoursReadDto?> GetByIdAsync(int id)
        {
            var seance = await _repository.GetSeanceByIdAsync(id);

            return seance == null
                ? null
                : _mapper.Map<SeanceCoursReadDto>(seance);
        }

        public async Task<SeanceCoursReadDto?> UpdateAsync(
            int id,
            SeanceCoursUpdateDto dto)
        {
            var seance = await _repository.GetSeanceByIdAsync(id);

            if (seance == null)
                throw new NotFoundException("Séance non trouvée.");

            if (dto.SalleId != 0)
                seance.SalleId = dto.SalleId;

            if (dto.CreneauId != 0)
                seance.CreneauId = dto.CreneauId;

            if (!string.IsNullOrEmpty(dto.CouleurAffichage))
                seance.CouleurAffichage = dto.CouleurAffichage;

            seance.EstTerminee = dto.EstTermine;

            await _repository.UpdateAsync(seance);

            _logger.LogInformation(
                "Séance {Id} mise à jour.",
                id);

            return _mapper.Map<SeanceCoursReadDto>(seance);
        }

        public async Task<bool> MarquerTermineeAsync(int id)
        {
            var seance = await _repository.GetSeanceByIdAsync(id);

            if (seance == null)
                throw new NotFoundException("Séance non trouvée.");

            seance.EstTerminee = true;

            await _repository.UpdateAsync(seance);

            _logger.LogInformation(
                "Séance {Id} marquée comme terminée.",
                id);

            return true;
        }

        public async Task<SeanceCoursReadDto> CreateAsync(
            SeanceCoursCreateDto dto)
        {
            if (!await _context.Utilisateurs.AnyAsync(u => u.Id == dto.ProfesseurId))
                throw new NotFoundException("Professeur non trouvé.");
            if (!await _context.Matieres.AnyAsync(m => m.Id == dto.MatiereId))
                throw new NotFoundException("Matière non trouvée.");
            if (!await _context.Salles.AnyAsync(s => s.Id == dto.SalleId))
                throw new NotFoundException("Salle non trouvée.");
            if (!await _context.Creneaux.AnyAsync(c => c.Id == dto.CreneauId))
                throw new NotFoundException("Créneau non trouvé.");

            var seance = new AppEmit.API.Entities.SeanceCours
            {
                ProfesseurId = dto.ProfesseurId,
                MatiereId = dto.MatiereId,
                SalleId = dto.SalleId,
                CreneauId = dto.CreneauId,
                ParcoursId = dto.ParcoursId,
                NiveauId = dto.NiveauId,
                DateDebutAnnee = dto.DateDebutAnnee,
                DateFinAnnee = dto.DateFinAnnee,
                CouleurAffichage = dto.CouleurAffichage,
                EstTerminee = false
            };

            await _repository.AddAsync(seance);

            _logger.LogInformation(
                "Séance créée avec succès. Id={Id}",
                seance.Id);

            return _mapper.Map<SeanceCoursReadDto>(seance);
        }
    }
}