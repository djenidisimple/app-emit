using AutoMapper;
using AppEmit.API.DTOs.Salle;
using AppEmit.API.Interfaces;
using AppEmit.API.Repositories;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services;

public class SalleService : ISalleService
{
    private readonly ISalleRepository _salleRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<SalleService> _logger;
    private readonly AppDbContext _context;

    public SalleService(ISalleRepository salleRepository, IMapper mapper, ILogger<SalleService> logger, AppDbContext context)
    {
        _salleRepository = salleRepository;
        _mapper = mapper;
        _logger = logger;
        _context = context;
    }

    public async Task<IEnumerable<SalleResponseDto>> GetAllAsync()
    {
        var salles = await _salleRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<SalleResponseDto>>(salles);
    }

    public async Task<SalleResponseDto?> GetByIdAsync(int id)
    {
        var salle = await _salleRepository.GetByIdAsync(id);
        if (salle == null)
        {
            _logger.LogWarning("Salle {Id} non trouvée.", id);
            return null;
        }
        return _mapper.Map<SalleResponseDto>(salle);
    }

    public async Task<SalleResponseDto> CreateAsync(SalleCreateDto createDto)
    {
        if (await _salleRepository.ExistsByCodeAsync(createDto.CodeSalle))
            throw new ConflictException("Une salle avec ce code existe déjà.");

        if (!string.IsNullOrEmpty(createDto.Libelle) && await _salleRepository.ExistsByLibelleAsync(createDto.Libelle))
            throw new ConflictException("Une salle avec ce libellé existe déjà.");

        var entity = _mapper.Map<Salle>(createDto);
        var created = await _salleRepository.AddAsync(entity);
        
        _logger.LogInformation("Salle {Code} créée.", created.CodeSalle);
        return _mapper.Map<SalleResponseDto>(created);
    }

    public async Task<SalleResponseDto?> UpdateAsync(int id, SalleUpdateDto updateDto)
    {
        var existing = await _salleRepository.GetByIdAsync(id);
        if (existing == null) throw new NotFoundException("Salle non trouvée.");

        _mapper.Map(updateDto, existing);
        var updated = await _salleRepository.UpdateSalleAsync(existing);
        
        _logger.LogInformation("Salle {Id} mise à jour.", id);
        return _mapper.Map<SalleResponseDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var salle = await _salleRepository.GetByIdAsync(id);
        if (salle == null) return false;

        await _salleRepository.DeleteAsync(salle);
        _logger.LogInformation("Salle {Id} supprimée.", id);
        return true;
    }

    public async Task<bool> IsSalleDisponibleAsync(int salleId, DateTime date, TimeSpan debut, TimeSpan fin)
    {
        var sallesDispo = await _salleRepository.GetSallesDisponiblesAsync(date, debut, fin);
        return sallesDispo.Any(s => s.Id == salleId);
    }

    public async Task<IEnumerable<SalleResponseDto>> GetDisponiblesAsync(DateTime date, int creneauId)
    {
        var creneau = await _context.Set<Entities.Creneau>().FindAsync(creneauId);
        if (creneau == null)
            return Enumerable.Empty<SalleResponseDto>();

        var dateOnly = date.Date;
        var salles = await _context.Salles.Where(s => s.EstActive).ToListAsync();
        var disponibles = new List<SalleResponseDto>();

        foreach (var salle in salles)
        {
            var occupeeParSeance = await _context.SeancesCours
                .AnyAsync(s =>
                    s.SalleId == salle.Id &&
                    s.DateDebutAnnee <= dateOnly &&
                    s.DateFinAnnee >= dateOnly &&
                    s.CreneauId == creneauId &&
                    !s.EstTerminee);

            var occupeeParReservation = await _context.Set<Entities.Reservation>()
                .Include(r => r.Evenement)
                .AnyAsync(r =>
                    r.SalleId == salle.Id &&
                    r.Evenement.DateEvenement.Date == dateOnly &&
                    r.Statut == "Confirmée");

            if (!occupeeParSeance && !occupeeParReservation)
            {
                var dto = _mapper.Map<SalleResponseDto>(salle);
                dto.EstDisponible = true;
                disponibles.Add(dto);
            }
        }

        return disponibles;
    }
}
