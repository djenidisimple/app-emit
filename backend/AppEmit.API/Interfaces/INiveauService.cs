using AppEmit.API.DTOs.Niveau;

namespace AppEmit.API.Interfaces
{
    public interface INiveauService
    {
        Task<IEnumerable<NiveauDto>> GetAllAsync();
        Task<NiveauDto?> GetByIdAsync(int id);
        Task<NiveauDto> CreateAsync(NiveauCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
