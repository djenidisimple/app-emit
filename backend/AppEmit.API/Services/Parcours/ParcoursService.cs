using AppEmit.DTOs.Parcours;
using AppEmit.Interfaces;
using AppEmit.Mappers;

namespace AppEmit.Services;
public class ParcoursService : IParcoursService
{
    private readonly IParcoursRepository _repo;
    private readonly IFiliereRepository? _filiereRepo; // si dispo
    public ParcoursService(IParcoursRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<ParcoursDto>> GetAllAsync()
    {
        var parcours = await _repo.GetAllAsync();
        return parcours.Select(ParcoursMapper.ToDto);
    }

    public async Task<ParcoursDto?> GetByIdAsync(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p == null ? null : ParcoursMapper.ToDto(p);
    }

    public async Task<ParcoursDto> CreateAsync(ParcoursCreateDto dto)
    {
        if (await _repo.ExistsByNameInFiliereAsync(dto.Nom, dto.FiliereId))
            throw new Exception("Un parcours avec ce nom existe déjà dans cette filière.");

        var entity = ParcoursMapper.ToEntity(dto);
        var created = await _repo.AddAsync(entity);
        return ParcoursMapper.ToDto(created);
    }

    public async Task<ParcoursDto?> UpdateAsync(int id, ParcoursCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;

        ParcoursMapper.UpdateEntity(existing, dto);
        var updated = await _repo.UpdateAsync(existing);
        return ParcoursMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return false;
        await _repo.DeleteAsync(p);
        return true;
    }
}