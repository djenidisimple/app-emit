using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories;

public class MatiereRepository : GenericRepository<Matiere>, IMatiereRepository
{
    public MatiereRepository(AppDbContext context) : base(context) { }

    public override async Task<IEnumerable<Matiere>> GetAllAsync()
    {
        return await _dbSet.Include(m => m.Niveau).ToListAsync();
    }

    public override async Task<Matiere?> GetByIdAsync(int id)
    {
        return await _dbSet.Include(m => m.Niveau).FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _dbSet.AnyAsync(m => m.Code == code);
    }

    public async Task<IEnumerable<Matiere>> GetByNiveauAsync(int niveauId)
    {
        return await _dbSet.Where(m => m.NiveauId == niveauId).Include(m => m.Niveau).ToListAsync();
    }
}
