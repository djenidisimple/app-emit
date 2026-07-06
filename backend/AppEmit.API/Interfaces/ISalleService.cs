using AppEmit.API.DTOs.Salle;

namespace AppEmit.API.Interfaces
{
    public interface ISalleService
    {
        Task<IEnumerable<SalleResponseDto>> GetAllAsync();
        Task<SalleResponseDto?> GetByIdAsync(int id);
        Task<SalleResponseDto> CreateAsync(SalleCreateDto dto);
        Task<SalleResponseDto?> UpdateAsync(int id, SalleUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> IsSalleDisponibleAsync(int salleId, DateTime date, TimeSpan debut, TimeSpan fin);
        Task<IEnumerable<SalleResponseDto>> GetDisponiblesAsync(DateTime date, int creneauId);
    }
}
