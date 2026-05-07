using AppEmit.DTOs.Matiere;

namespace AppEmit.Interfaces;

public interface IMatiereService
{
    Task<IEnumerable<MatiereDto>> GetAllAsync();
    Task<MatiereDto?> GetByIdAsync(int id);
    Task<MatiereDto> CreateAsync(MatiereCreateDto dto);
    Task<MatiereDto?> UpdateAsync(int id, MatiereCreateDto dto);
    Task<bool> DeleteAsync(int id);
}