using AppEmit.API.Entities;
using AppEmit.API.Data;
using Microsoft.EntityFrameworkCore;
using AppEmit.API.DTOs.Salle;
using AppEmit.API.Interfaces;

namespace AppEmit.API.Repositories
{
    public class SalleRepository : GenericRepository<Salle>, ISalleRepository
    {
        private readonly AppDbContext _salleContext;

        public SalleRepository(AppDbContext context) : base(context)
        {
            _salleContext = context;
        }

        public async Task<bool> ExistsByCodeAsync(string codeSalle, int? excludeId = null)
        {
            return await _context.Salles
                .AnyAsync(s => s.CodeSalle == codeSalle && (!excludeId.HasValue || s.Id != excludeId.Value));
        }

        public async Task<bool> ExistsByLibelleAsync(string libelle, int? excludeId = null)
        {
            return await _context.Salles
                .AnyAsync(s => s.Libelle == libelle && (!excludeId.HasValue || s.Id != excludeId.Value));
        }

        public async Task<bool> DeleteSalleAsync(Salle entity)
        {
            _salleContext.Salles.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // BASIC
        // =========================
        public async Task<Salle?> GetByIdAsync(int id)
        {
            return await _context.Salles.FindAsync(id);
        }

        // =========================
        // DISPONIBILITE
        // =========================
        public async Task<IEnumerable<Salle>> GetSallesDisponiblesAsync(
            DateTime date,
            TimeSpan debut,
            TimeSpan fin)
        {
            return await _context.Salles
                .Include(s => s.Seances)
                    .ThenInclude(seance => seance.Creneau)
                .Where(s => s.EstActive)
                .Where(s => !s.Seances.Any(seance =>
                    seance.DateDebutAnnee <= date &&
                    seance.DateFinAnnee >= date &&
                    seance.Creneau.HeureDebut < fin &&
                    seance.Creneau.HeureFin > debut))
                .ToListAsync();
        }

        // =========================
        // CAPACITE
        // =========================
        public async Task<IEnumerable<Salle>> GetSallesByCapaciteMinAsync(int capaciteMin)
        {
            return await _context.Salles
                .Where(s => s.Capacite >= capaciteMin)
                .ToListAsync();
        }

        public async Task<Salle> UpdateSalleAsync(Salle entity)
        {
            _salleContext.Salles.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        // =========================
        // STATUS
        // =========================
        public async Task<IEnumerable<Salle>> GetSallesActivesAsync()
        {
            return await _context.Salles
                .Where(s => s.EstActive)
                .ToListAsync();
        }

        // =========================
        // CODE UNIQUE CHECK
        // =========================
        public async Task<Salle?> GetSalleByCodeAsync(string codeSalle)
        {
            return await _context.Salles
                .FirstOrDefaultAsync(s => s.CodeSalle == codeSalle);
        }

        // =========================
        // SEANCES DETAILS
        // =========================
        public async Task<Salle?> GetSalleWithSeancesAsync(int id)
        {
            return await _context.Salles
                .Include(s => s.Seances)
                    .ThenInclude(seance => seance.Creneau)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        // =========================
        // CHECK OCCUPATION
        // =========================
        public async Task<bool> IsSalleOccupedAsync(
            int salleId,
            DateTime date,
            TimeSpan debut,
            TimeSpan fin)
        {
            return await _context.SeancesCours
                .Where(s => s.SalleId == salleId)
                .AnyAsync(seance =>
                    seance.DateDebutAnnee <= date &&
                    seance.DateFinAnnee >= date &&
                    seance.Creneau.HeureDebut < fin &&
                    seance.Creneau.HeureFin > debut);
        }
    }
}
