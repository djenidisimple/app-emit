using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class UtilisateurRepository : GenericRepository<Utilisateur>, IUtilisateurRepository
    {
        public UtilisateurRepository(AppDbContext context) : base(context) { }

        public async Task<Utilisateur?> GetProfesseurBySeanceAsync(int seanceCoursId)
        {
            var seance = await _context.SeancesCours
                .Include(s => s.Professeur)
                .FirstOrDefaultAsync(s => s.Id == seanceCoursId);
            return seance?.Professeur;
        }

        public async Task<List<Utilisateur>> GetEtudiantsBySeanceAsync(int seanceCoursId)
        {
            var seance = await _context.SeancesCours
                .Include(s => s.Niveau)
                .FirstOrDefaultAsync(s => s.Id == seanceCoursId);

            if (seance?.Niveau == null)
                return new List<Utilisateur>();

            return await _context.Utilisateurs
                .Where(u => u.Role == "Etudiant" && u.NiveauId == seance.NiveauId)
                .ToListAsync();
        }
    }
}
