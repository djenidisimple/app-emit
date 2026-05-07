using AppEmit.Data;
using AppEmit.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class ExceptionPlanningRepository : IExceptionPlanningRepository
    {
        private readonly AppDbContext _context;
        public ExceptionPlanningRepository(AppDbContext context) => _context = context;

        public async Task<List<ExceptionPlanning>> GetExceptionsForSeancesAsync(List<int> seanceIds)
        {
            if (seanceIds == null || !seanceIds.Any())
                return new List<ExceptionPlanning>();
            return await _context.ExceptionsPlanning
                .Where(e => seanceIds.Contains(e.SeanceCoursId))
                .Include(e => e.SeanceOriginale)
                .ToListAsync();
        }

        public void Add(ExceptionPlanning exception)
        {
            _context.ExceptionsPlanning.Add(exception);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}