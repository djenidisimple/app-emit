using AutoMapper;
using AppEmit.API.DTOs.Parcours;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;

namespace AppEmit.API.Services;

public class ParcoursService : IParcoursService
{
    private readonly IParcoursRepository _repo;
    private readonly IMapper _mapper;

    public ParcoursService(IParcoursRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ParcoursDto>> GetAllAsync()
    {
        var parcours = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<ParcoursDto>>(parcours);
    }

    public async Task<ParcoursDto?> GetByIdAsync(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p == null ? null : _mapper.Map<ParcoursDto>(p);
    }

    public async Task<ParcoursDto> CreateAsync(ParcoursCreateDto dto)
    {
        if (await _repo.ExistsByNameInFiliereAsync(dto.Nom, dto.FiliereId))
            throw new ConflictException("Un parcours avec ce nom existe déjà dans cette filière.");

        var entity = _mapper.Map<Parcours>(dto);
        var created = await _repo.AddAsync(entity);
        return _mapper.Map<ParcoursDto>(created);
    }

    public async Task<ParcoursDto?> UpdateAsync(int id, ParcoursCreateDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) throw new NotFoundException("Parcours non trouvé.");

        _mapper.Map(dto, existing);
        await _repo.UpdateAsync(existing);
        return _mapper.Map<ParcoursDto>(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return false;

        await _repo.DeleteAsync(entity);
        return true;
    }
}
