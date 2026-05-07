using AppEmit.DTOs.Salle;
using AppEmit.Entities;
using AppEmit.Interfaces;
using AppEmit.Mappers;

namespace AppEmit.Services;

public class SalleService : ISalleService
{
    private readonly ISalleRepository _salleRepository;

    public SalleService(ISalleRepository salleRepository)
    {
        _salleRepository = salleRepository;
    }

    public async Task<IEnumerable<SalleDto>> GetAllAsync()
    {
        var salles = await _salleRepository.GetAllAsync();
        return salles.Select(SalleMapper.ToDto);
    }

    public async Task<SalleDto?> GetByIdAsync(int id)
    {
        var salle = await _salleRepository.GetByIdAsync(id);
        return salle == null ? null : SalleMapper.ToDto(salle);
    }

    public async Task<SalleDto> CreateAsync(SalleCreateDto createDto)
    {
        if (await _salleRepository.ExistsByCodeAsync(createDto.CodeSalle))
            throw new Exception("Une salle avec ce code existe déjà.");

        var entity = SalleMapper.ToEntity(createDto);
        var created = await _salleRepository.AddAsync(entity);
        return SalleMapper.ToDto(created);
    }

    public async Task<SalleDto?> UpdateAsync(int id, SalleCreateDto updateDto)
    {
        var existing = await _salleRepository.GetByIdAsync(id);
        if (existing == null) return null;

        SalleMapper.UpdateEntity(existing, updateDto);
        var updated = await _salleRepository.UpdateAsync(existing);
        return SalleMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var salle = await _salleRepository.GetByIdAsync(id);
        if (salle == null) return false;

        await _salleRepository.DeleteAsync(salle);
        return true;
    }

    public async Task<bool> IsSalleDisponibleAsync(int salleId, DateTime date, TimeSpan debut, TimeSpan fin)
    {
        var sallesDispo = await _salleRepository.GetSallesDisponiblesAsync(date, debut, fin);
        return sallesDispo.Any(s => s.Id == salleId);
    }
}