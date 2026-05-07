using AppEmit.DTOs.Parcours;

namespace AppEmit.Interfaces;

public interface IParcoursService
{
    Task<IEnumerable<ParcoursDto>> GetAllAsync();
    Task<ParcoursDto?> GetByIdAsync(int id);
    Task<ParcoursDto> CreateAsync(ParcoursCreateDto dto);
    Task<ParcoursDto?> UpdateAsync(int id, ParcoursCreateDto dto);
    Task<bool> DeleteAsync(int id);
}