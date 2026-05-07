using AppEmit.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface IExceptionPlanningRepository
    {
        Task<List<ExceptionPlanning>> GetExceptionsForSeancesAsync(List<int> seanceIds);
        void Add(ExceptionPlanning exception);
        Task SaveChangesAsync();
    }
}