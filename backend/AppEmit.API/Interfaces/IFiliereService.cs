using AppEmit.API.DTOs.Filiere;

namespace AppEmit.API.Interfaces
{
    public interface IFiliereService
    {
        Task<IEnumerable<FiliereDto>> GetAllAsync();
        Task<FiliereDto?> GetByIdAsync(int id);
        Task<FiliereDto> CreateAsync(FiliereCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
