using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces;

public interface IAffectationRepository : IGenericRepository<ProfesseurMatiere>
{
    Task<IEnumerable<ProfesseurMatiere>> GetAllWithIncludesAsync();
    Task<ProfesseurMatiere?> GetByIdWithIncludesAsync(int id);
    Task<IEnumerable<ProfesseurMatiere>> GetByProfesseurIdAsync(int professeurId);
    Task<bool> ExistsAsync(int professeurId, int matiereId, int? parcoursId, int? niveauId);
}
