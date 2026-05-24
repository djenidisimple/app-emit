using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories
{
    public class DemandeEchangeRepository : GenericRepository<DemandeEchange>, IDemandeEchangeRepository
    {
        public DemandeEchangeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DemandeEchange>> GetDemandesByProfesseurDemandeurAsync(int professeurId)
        {
            return await _dbSet
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Salle)
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Creneau)
                .Include(d => d.ProfesseurDemandeur)
                .Include(d => d.ProfesseurCible)
                .Where(d => d.ProfesseurDemandeurId == professeurId)
                .OrderByDescending(d => d.DateDemande)
                .ToListAsync();
        }

        public async Task<IEnumerable<DemandeEchange>> GetDemandesByProfesseurCibleAsync(int professeurId)
        {
            return await _dbSet
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Salle)
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Creneau)
                .Include(d => d.ProfesseurDemandeur)
                .Include(d => d.ProfesseurCible)
                .Where(d => d.ProfesseurCibleId == professeurId)
                .OrderByDescending(d => d.DateDemande)
                .ToListAsync();
        }

        public async Task<DemandeEchange?> GetDemandeWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Salle)
                .Include(d => d.SeanceCours)
                    .ThenInclude(s => s.Creneau)
                .Include(d => d.ProfesseurDemandeur)
                .Include(d => d.ProfesseurCible)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<bool> ExistsPendingDemandeForSeanceAsync(int seanceCoursId, int professeurDemandeurId, int professeurCibleId)
        {
            return await _dbSet.AnyAsync(d =>
                d.SeanceCoursId == seanceCoursId &&
                d.ProfesseurDemandeurId == professeurDemandeurId &&
                d.ProfesseurCibleId == professeurCibleId &&
                d.Statut == "En attente");
        }
    }
}