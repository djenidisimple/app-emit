using AppEmit.API.DTOs.Matiere;

namespace AppEmit.API.Interfaces;

public interface IMatiereService
{
    Task<IEnumerable<MatiereDto>> GetAllAsync();
    Task<MatiereDto?> GetByIdAsync(int id);
    Task<MatiereDto> CreateAsync(MatiereCreateDto dto);
    Task<MatiereDto?> UpdateAsync(int id, MatiereCreateDto dto);
    Task<bool> DeleteAsync(int id);
}
