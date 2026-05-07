using AppEmit.DTOs.Salle;

namespace AppEmit.Interfaces
{
    public interface ISalleService
    {
        Task<IEnumerable<SalleResponseDto>> GetAllSallesAsync();
        Task<SalleDetailsDto?> GetSalleByIdAsync(int id);
        Task<SalleResponseDto> CreateSalleAsync(SalleCreateDto createDto);
        Task<SalleResponseDto> UpdateSalleAsync(SalleUpdateDto updateDto);
        Task<bool> DeleteSalleAsync(int id);
        Task<IEnumerable<SalleResponseDto>> GetSallesDisponiblesAsync(DateTime date, TimeSpan heureDebut, TimeSpan heureFin);
        Task<IEnumerable<SalleResponseDto>> GetSallesByCapaciteAsync(int capaciteMin);
        Task<bool> ToggleSalleStatusAsync(int id);
        Task<bool> IsCodeUniqueAsync(string codeSalle, int? excludeId = null);
    }
}