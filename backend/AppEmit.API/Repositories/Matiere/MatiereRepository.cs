using AppEmit.Entities;
using AppEmit.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.Repositories;

public class MatiereRepository : GenericRepository<Matiere>, IMatiereRepository
{
    public MatiereRepository(ApplicationDbContext context) : base(context) { }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _dbSet.AnyAsync(m => m.Code == code);
    }
}