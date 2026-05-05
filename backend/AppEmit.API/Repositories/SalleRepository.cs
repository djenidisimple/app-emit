using AppEmit.Entities;
using AppEmit.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace AppEmit.Repositories;
public class SalleRepository : GenericRepository<Salle>, ISalleRepository
{
    public SalleRepository(ApplicationDbContext context) : base(context)
    {
    }
    public async Task<IEnumerable<Salle>> GetSallesDisponiblesAsync(DateTime date, TimeSpan debut, TimeSpan fin)
    {
        return await _dbSet
            .Where(s => s.EstActive)
            .Where(s => !s.Seances.Any(seance =>
                seance.DateDebutAnnee <= date &&
                seance.DateFinAnnee >= date &&
                seance.Creneau.HeureDebut < fin &&
                seance.Creneau.HeureFin > debut))
            .ToListAsync();
    }
    public async Task<bool> ExistsByCodeAsync(string codeSalle)
    {
        return await _dbSet.AnyAsync(s => s.CodeSalle == codeSalle);
    }
}