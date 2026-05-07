using AppEmit.Data;
using AppEmit.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class UtilisateurRepository : IUtilisateurRepository
    {
        private readonly AppDbContext _context;

        public UtilisateurRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Utilisateur?> GetProfesseurBySeanceAsync(int seanceCoursId)
        {
            var seance = await _context.SeancesCours
                .Include(s => s.Professeur)
                .FirstOrDefaultAsync(s => s.Id == seanceCoursId);
            return seance?.Professeur;
        }

        public async Task<List<Utilisateur>> GetEtudiantsBySeanceAsync(int seanceCoursId)
        {
            // En attente d'implémentation complète
            return await Task.FromResult(new List<Utilisateur>());
        }
    }
}