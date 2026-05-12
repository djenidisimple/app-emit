using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces;

public interface ISalleRepository : IGenericRepository<Salle>
{
    Task<bool> ExistsByCodeAsync(string codeSalle, int? excludeId = null);
    Task<Salle?> GetByIdAsync(int id);
    Task<IEnumerable<Salle>> GetSallesDisponiblesAsync(DateTime date, TimeSpan debut, TimeSpan fin);
    Task<IEnumerable<Salle>> GetSallesByCapaciteMinAsync(int capaciteMin);
    Task<Salle> UpdateSalleAsync(Salle entity);
    Task<IEnumerable<Salle>> GetSallesActivesAsync();
    Task<Salle?> GetSalleByCodeAsync(string codeSalle);
    Task<Salle?> GetSalleWithSeancesAsync(int id);
    Task<bool> IsSalleOccupedAsync(int salleId, DateTime date, TimeSpan debut, TimeSpan fin);
    Task<bool> DeleteAsync(Salle entity);
}
