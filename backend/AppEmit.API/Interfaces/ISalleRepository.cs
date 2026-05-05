using AppEmit.Entities;

namespace AppEmit.Interfaces
{
    public interface ISalleRepository : IGenericRepository<Salle>
    {
        Task<IEnumerable<Salle>> GetSallesDisponiblesAsync(DateTime date, TimeSpan heureDebut, TimeSpan heureFin);
        Task<IEnumerable<Salle>> GetSallesByCapaciteMinAsync(int capaciteMin);
        Task<Salle?> GetSalleWithSeancesAsync(int id);
        Task<bool> IsSalleOccupedAsync(int salleId, DateTime date, TimeSpan heureDebut, TimeSpan heureFin);
        Task<IEnumerable<Salle>> GetSallesActivesAsync();
        Task<Salle?> GetSalleByCodeAsync(string codeSalle);
    }
}