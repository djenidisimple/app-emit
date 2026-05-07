using AppEmit.DTOs.Matiere;
using AppEmit.Interfaces;
using AppEmit.Mappers;

namespace AppEmit.Services;

public class MatiereService : IMatiereService
{
    private readonly IMatiereRepository _repo;

    public MatiereService(IMatiereRepository repo) => _repo = repo;

    public async Task<IEnumerable<MatiereDto>> GetAllAsync()
    {
        var matieres = await _repo.GetAllAsync();
        return matieres.Select(MatiereMapper.ToDto);
    }

    public async Task<MatiereDto?> GetByIdAsync(int id)
    {
        var m = await _repo.GetByIdAsync(id);
        return m == null ? null : MatiereMapper.ToDto(m);
    }

    public async Task<MatiereDto> CreateAsync(MatiereCreateDto dto)
    {
        if (await _repo.ExistsByCodeAsync(dto.Code))
            throw new Exception("Code matière déjà existant.");

        var entity = MatiereMapper.ToEntity(dto);
        var created = await _repo.AddAsync(entity);
        return MatiereMapper.ToDto(created);
    }

    public async Task<MatiereDto?> UpdateAsync(int id, MatiereCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;

        MatiereMapper.UpdateEntity(existing, dto);
        var updated = await _repo.UpdateAsync(existing);
        return MatiereMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var matiere = await _repo.GetByIdAsync(id);
        if (matiere == null) return false;
        await _repo.DeleteAsync(matiere);
        return true;
    }
}