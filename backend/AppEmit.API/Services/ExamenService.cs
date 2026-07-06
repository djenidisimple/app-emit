using AutoMapper;
using AppEmit.API.Data;
using AppEmit.API.DTOs.Examen;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Services
{
    public class ExamenService : IExamenService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ExamenService> _logger;

        public ExamenService(AppDbContext context, IMapper mapper, ILogger<ExamenService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<ExamenReadDto>> GetAllAsync()
        {
            var examens = await _context.Examens
                .Include(e => e.Matiere)
                .Include(e => e.Professeur)
                .Include(e => e.Salle)
                .OrderBy(e => e.DateExamen)
                .ThenBy(e => e.HeureDebut)
                .ToListAsync();

            return _mapper.Map<List<ExamenReadDto>>(examens);
        }

        public async Task<ExamenReadDto?> GetByIdAsync(int id)
        {
            var examen = await _context.Examens
                .Include(e => e.Matiere)
                .Include(e => e.Professeur)
                .Include(e => e.Salle)
                .FirstOrDefaultAsync(e => e.Id == id);

            return examen == null ? null : _mapper.Map<ExamenReadDto>(examen);
        }

        public async Task<List<ExamenReadDto>> GetByNiveauAsync(int niveauId)
        {
            var examens = await _context.Examens
                .Include(e => e.Matiere)
                .Include(e => e.Professeur)
                .Include(e => e.Salle)
                .Where(e => e.NiveauId == niveauId)
                .OrderBy(e => e.DateExamen)
                .ThenBy(e => e.HeureDebut)
                .ToListAsync();

            return _mapper.Map<List<ExamenReadDto>>(examens);
        }

        public async Task<List<ExamenReadDto>> GetByParcoursAsync(int parcoursId)
        {
            var examens = await _context.Examens
                .Include(e => e.Matiere)
                .Include(e => e.Professeur)
                .Include(e => e.Salle)
                .Where(e => e.ParcoursId == parcoursId)
                .OrderBy(e => e.DateExamen)
                .ThenBy(e => e.HeureDebut)
                .ToListAsync();

            return _mapper.Map<List<ExamenReadDto>>(examens);
        }

        public async Task<ExamenReadDto> CreateAsync(ExamenCreateDto dto)
        {
            if (!await _context.Matieres.AnyAsync(m => m.Id == dto.MatiereId))
                throw new NotFoundException("Matière non trouvée.");
            if (!await _context.Utilisateurs.AnyAsync(u => u.Id == dto.ProfesseurId))
                throw new NotFoundException("Professeur non trouvé.");
            if (!await _context.Salles.AnyAsync(s => s.Id == dto.SalleId))
                throw new NotFoundException("Salle non trouvée.");

            if (!TimeSpan.TryParse(dto.HeureDebut, out var heureDebut))
                throw new BadRequestException("Format d'heure de début invalide.");
            if (!TimeSpan.TryParse(dto.HeureFin, out var heureFin))
                throw new BadRequestException("Format d'heure de fin invalide.");

            var examen = new Entities.Examen
            {
                MatiereId = dto.MatiereId,
                ProfesseurId = dto.ProfesseurId,
                SalleId = dto.SalleId,
                ParcoursId = dto.ParcoursId,
                NiveauId = dto.NiveauId,
                DateExamen = dto.DateExamen,
                HeureDebut = heureDebut,
                HeureFin = heureFin,
                Description = dto.Description
            };

            _context.Examens.Add(examen);
            await _context.SaveChangesAsync();

            await _context.Entry(examen).Reference(e => e.Matiere).LoadAsync();
            await _context.Entry(examen).Reference(e => e.Professeur).LoadAsync();
            await _context.Entry(examen).Reference(e => e.Salle).LoadAsync();

            _logger.LogInformation("Examen créé avec succès. Id={Id}, Matiere={MatiereId}", examen.Id, examen.MatiereId);

            return _mapper.Map<ExamenReadDto>(examen);
        }

        public async Task<ExamenReadDto?> UpdateAsync(int id, ExamenUpdateDto dto)
        {
            var examen = await _context.Examens
                .Include(e => e.Matiere)
                .Include(e => e.Professeur)
                .Include(e => e.Salle)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (examen == null)
                throw new NotFoundException("Examen non trouvé.");

            if (dto.MatiereId != 0 && dto.MatiereId != examen.MatiereId)
            {
                if (!await _context.Matieres.AnyAsync(m => m.Id == dto.MatiereId))
                    throw new NotFoundException("Matière non trouvée.");
                examen.MatiereId = dto.MatiereId;
            }

            if (dto.ProfesseurId != 0)
                examen.ProfesseurId = dto.ProfesseurId;

            if (dto.SalleId != 0)
                examen.SalleId = dto.SalleId;

            if (dto.ParcoursId.HasValue)
                examen.ParcoursId = dto.ParcoursId;

            if (dto.NiveauId.HasValue)
                examen.NiveauId = dto.NiveauId;

            if (dto.DateExamen != default)
                examen.DateExamen = dto.DateExamen;

            if (!string.IsNullOrEmpty(dto.HeureDebut) && TimeSpan.TryParse(dto.HeureDebut, out var hd))
                examen.HeureDebut = hd;

            if (!string.IsNullOrEmpty(dto.HeureFin) && TimeSpan.TryParse(dto.HeureFin, out var hf))
                examen.HeureFin = hf;

            examen.Description = dto.Description;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Examen {Id} mis à jour.", id);

            return _mapper.Map<ExamenReadDto>(examen);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var examen = await _context.Examens.FindAsync(id);
            if (examen == null)
                return false;

            _context.Examens.Remove(examen);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Examen {Id} supprimé.", id);

            return true;
        }
    }
}
