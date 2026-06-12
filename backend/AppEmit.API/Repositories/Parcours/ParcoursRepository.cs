using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories;

public class ParcoursRepository : GenericRepository<Parcours>, IParcoursRepository
{
    public ParcoursRepository(AppDbContext context) : base(context) { }

    public async Task<bool> ExistsByNameInFiliereAsync(string nom, int filiereId)
    {
        return await _dbSet.AnyAsync(p => p.Nom == nom && p.FiliereId == filiereId);
    }
}
