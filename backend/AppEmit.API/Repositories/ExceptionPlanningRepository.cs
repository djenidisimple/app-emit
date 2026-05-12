using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class ExceptionPlanningRepository : GenericRepository<ExceptionPlanning>, IExceptionPlanningRepository
    {
        public ExceptionPlanningRepository(AppDbContext context) : base(context) { }

        public async Task<List<ExceptionPlanning>> GetExceptionsForSeancesAsync(List<int> seanceIds)
        {
            if (seanceIds == null || !seanceIds.Any())
                return new List<ExceptionPlanning>();
            return await _context.ExceptionsPlanning
                .Where(e => seanceIds.Contains(e.SeanceCoursId))
                .Include(e => e.SeanceOriginale)
                .ToListAsync();
        }
    }
}
