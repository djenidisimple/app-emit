using AutoMapper;
using AppEmit.API.DTOs.Affectation;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;

namespace AppEmit.API.Services;

public class AffectationService : IAffectationService
{
    private readonly IAffectationRepository _repo;
    private readonly IMapper _mapper;

    public AffectationService(IAffectationRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AffectationDto>> GetAllAsync()
    {
        var affectations = await _repo.GetAllWithIncludesAsync();
        return affectations.Select(MapToDto);
    }

    public async Task<AffectationDto?> GetByIdAsync(int id)
    {
        var aff = await _repo.GetByIdWithIncludesAsync(id);
        return aff == null ? null : MapToDto(aff);
    }

    public async Task<IEnumerable<AffectationDto>> GetByProfesseurIdAsync(int professeurId)
    {
        var affectations = await _repo.GetByProfesseurIdAsync(professeurId);
        return affectations.Select(MapToDto);
    }

    public async Task<AffectationDto> CreateAsync(AffectationCreateDto dto)
    {
        if (await _repo.ExistsAsync(dto.ProfesseurId, dto.MatiereId, dto.ParcoursId, dto.NiveauId))
            throw new InvalidOperationException("Cette affectation existe déjà.");

        var entity = new ProfesseurMatiere
        {
            ProfesseurId = dto.ProfesseurId,
            MatiereId = dto.MatiereId,
            ParcoursId = dto.ParcoursId,
            NiveauId = dto.NiveauId
        };

        var created = await _repo.AddAsync(entity);
        var result = await _repo.GetByIdWithIncludesAsync(created.Id);
        return MapToDto(result!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;
        await _repo.DeleteAsync(entity);
        return true;
    }

    private static AffectationDto MapToDto(ProfesseurMatiere pm)
    {
        return new AffectationDto
        {
            Id = pm.Id,
            ProfesseurId = pm.ProfesseurId,
            ProfesseurNom = pm.Professeur?.Nom ?? "",
            ProfesseurPrenom = pm.Professeur?.Prenom ?? "",
            MatiereId = pm.MatiereId,
            MatiereNom = pm.Matiere?.Nom ?? "",
            MatiereCode = pm.Matiere?.Code ?? "",
            ParcoursId = pm.ParcoursId,
            ParcoursNom = pm.Parcours?.Nom,
            NiveauId = pm.NiveauId,
            NiveauCode = pm.Niveau?.Code,
        };
    }
}
