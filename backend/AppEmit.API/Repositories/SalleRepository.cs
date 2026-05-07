using AppEmit.Data;
using AppEmit.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class SalleRepository : ISalleRepository
    {
        private readonly AppDbContext _context;
        public SalleRepository(AppDbContext context) => _context = context;

        public async Task<Salle?> GetByIdAsync(int id)
        {
            return await _context.Salles.FindAsync(id);
        }
    }
}