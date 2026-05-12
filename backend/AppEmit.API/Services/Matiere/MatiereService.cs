using AutoMapper;
using AppEmit.API.DTOs.Matiere;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;

namespace AppEmit.API.Services;

public class MatiereService : IMatiereService
{
    private readonly IMatiereRepository _repo;
    private readonly IMapper _mapper;

    public MatiereService(IMatiereRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<MatiereDto>> GetAllAsync()
    {
        var matieres = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<MatiereDto>>(matieres);
    }

    public async Task<MatiereDto?> GetByIdAsync(int id)
    {
        var m = await _repo.GetByIdAsync(id);
        return m == null ? null : _mapper.Map<MatiereDto>(m);
    }

    public async Task<MatiereDto> CreateAsync(MatiereCreateDto dto)
    {
        if (await _repo.ExistsByCodeAsync(dto.Code))
            throw new ConflictException("Code matière déjà existant.");

        var entity = _mapper.Map<Matiere>(dto);
        var created = await _repo.AddAsync(entity);
        return _mapper.Map<MatiereDto>(created);
    }

    public async Task<MatiereDto?> UpdateAsync(int id, MatiereCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) throw new NotFoundException("Matière non trouvée.");

        _mapper.Map(dto, existing);
        await _repo.UpdateAsync(existing);
        return _mapper.Map<MatiereDto>(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;

        await _repo.DeleteAsync(entity);
        return true;
    }
}
