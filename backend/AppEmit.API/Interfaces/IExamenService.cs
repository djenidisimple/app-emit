using AppEmit.API.DTOs.Examen;

namespace AppEmit.API.Interfaces
{
    public interface IExamenService
    {
        Task<List<ExamenReadDto>> GetAllAsync();
        Task<ExamenReadDto?> GetByIdAsync(int id);
        Task<List<ExamenReadDto>> GetByNiveauAsync(int niveauId);
        Task<List<ExamenReadDto>> GetByParcoursAsync(int parcoursId);
        Task<ExamenReadDto> CreateAsync(ExamenCreateDto dto);
        Task<ExamenReadDto?> UpdateAsync(int id, ExamenUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
