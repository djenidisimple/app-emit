using AppEmit.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Repositories
{
    public class SalleRepository : GenericRepository<Salle>, ISalleRepository
    {
        private readonly AppDbContext _context;

        public SalleRepository(AppDbContext context) : base(context)
        {
            _context = context;
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