using AppEmit.API.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface ISeanceCoursRepository : IGenericRepository<SeanceCours>
    {
        Task<List<SeanceCours>> GetSeancesForWeekAsync(DateTime monday, DateTime saturday, int? professeurId, int? salleId, int? niveauId);
        Task<SeanceCours?> GetSeanceByIdAsync(int id);
    }
}
