using AppEmit.API.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface IExceptionPlanningRepository : IGenericRepository<ExceptionPlanning>
    {
        Task<List<ExceptionPlanning>> GetExceptionsForSeancesAsync(List<int> seanceIds);
    }
}
