using AppEmit.Entities;

namespace AppEmit.Interfaces
{
    public interface ISalleRepository : IGenericRepository<Salle>
    {
        Task<Salle?> GetByCodeAsync(string code);
        Task<IEnumerable<Salle>> GetSallesActivesAsync();
    }
}