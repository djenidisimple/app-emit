using AppEmit.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface ISeanceCoursRepository
    {
        Task<List<SeanceCours>> GetSeancesForWeekAsync(DateTime monday, DateTime saturday, int? professeurId, int? salleId);
        Task<SeanceCours?> GetSeanceByIdAsync(int id);
    }
}