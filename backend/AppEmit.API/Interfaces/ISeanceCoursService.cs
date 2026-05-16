using AppEmit.API.DTOs.SeanceCours;

namespace AppEmit.API.Interfaces
{
    public interface ISeanceCoursService
    {
        Task<SeanceCoursReadDto?> GetByIdAsync(int id);
        Task<SeanceCoursReadDto?> UpdateAsync(int id, SeanceCoursUpdateDto dto);
        Task<bool> MarquerTermineeAsync(int id);
    }
}
