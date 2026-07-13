using AppEmit.API.DTOs.Affectation;

namespace AppEmit.API.Interfaces;

public interface IAffectationService
{
    Task<IEnumerable<AffectationDto>> GetAllAsync();
    Task<AffectationDto?> GetByIdAsync(int id);
    Task<IEnumerable<AffectationDto>> GetByProfesseurIdAsync(int professeurId);
    Task<AffectationDto> CreateAsync(AffectationCreateDto dto);
    Task<bool> DeleteAsync(int id);
}
