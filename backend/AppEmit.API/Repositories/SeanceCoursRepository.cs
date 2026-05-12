using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class SeanceCoursRepository : GenericRepository<SeanceCours>, ISeanceCoursRepository
    {
        public SeanceCoursRepository(AppDbContext context) : base(context) { }

        public async Task<List<SeanceCours>> GetSeancesForWeekAsync(DateTime monday, DateTime saturday, int? professeurId, int? salleId)
        {
            var query = _context.SeancesCours
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .Where(s => s.DateDebutAnnee <= saturday && s.DateFinAnnee >= monday);
            if (professeurId.HasValue) query = query.Where(s => s.ProfesseurId == professeurId.Value);
            if (salleId.HasValue) query = query.Where(s => s.SalleId == salleId.Value);
            return await query.ToListAsync();
        }

        public async Task<SeanceCours?> GetSeanceByIdAsync(int id)
        {
            return await _context.SeancesCours
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }
}
