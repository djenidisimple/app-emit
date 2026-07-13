using AppEmit.API.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface ISeanceCoursRepository : IGenericRepository<SeanceCours>
    {
        Task<List<SeanceCours>> GetSeancesForWeekAsync(DateTime monday, DateTime saturday, int? professeurId, int? salleId, int? niveauId, int? parcoursId = null);
        Task<SeanceCours?> GetSeanceByIdAsync(int id);
    }
}
