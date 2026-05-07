using AppEmit.Data;
using AppEmit.Entities;
using AppEmit.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.Repositories
{
    public class SalleRepository : GenericRepository<Salle>, ISalleRepository
    {
        public SalleRepository(AppDbContext context) : base(context) { }

        public async Task<Salle?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.CodeSalle == code);
        }

        public async Task<IEnumerable<Salle>> GetSallesActivesAsync()
        {
            return await _dbSet.Where(s => s.EstActive).ToListAsync();
        }
    }
}