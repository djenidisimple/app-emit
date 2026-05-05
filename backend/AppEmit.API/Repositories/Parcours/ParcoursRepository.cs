using AppEmit.Entities;
using AppEmit.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.Repositories;

public class ParcoursRepository : GenericRepository<Parcours>, IParcoursRepository
{
    public ParcoursRepository(ApplicationDbContext context) : base(context) { }

    public async Task<bool> ExistsByNameInFiliereAsync(string nom, int filiereId)
    {
        return await _dbSet.AnyAsync(p => p.Nom == nom && p.FiliereId == filiereId);
    }
}