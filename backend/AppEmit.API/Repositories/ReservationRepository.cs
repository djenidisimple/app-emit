using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories
{
    public class ReservationRepository : GenericRepository<Reservation>, IReservationRepository
    {
        public ReservationRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Reservation>> GetReservationsByUserAsync(int utilisateurId)
        {
            return await _dbSet
                .Where(r => r.UtilisateurId == utilisateurId)
                .Include(r => r.Utilisateur)
                .Include(r => r.Evenement)
                .Include(r => r.Salle)
                .Include(r => r.Parcours)
                .Include(r => r.Niveau)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetReservationsByStatutAsync(string statut)
        {
            return await _dbSet
                .Where(r => r.Statut == statut)
                .Include(r => r.Utilisateur)
                .Include(r => r.Evenement)
                .Include(r => r.Salle)
                .Include(r => r.Parcours)
                .Include(r => r.Niveau)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetAllWithIncludesAsync()
        {
            return await _dbSet
                .Include(r => r.Utilisateur)
                .Include(r => r.Evenement)
                .Include(r => r.Salle)
                .Include(r => r.Parcours)
                .Include(r => r.Niveau)
                .ToListAsync();
        }

        public async Task<Reservation?> GetByIdWithIncludesAsync(int id)
        {
            return await _dbSet
                .Include(r => r.Utilisateur)
                .Include(r => r.Evenement)
                .Include(r => r.Salle)
                .Include(r => r.Parcours)
                .Include(r => r.Niveau)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<bool> HasConflictAsync(int salleId, DateTime date, string session)
        {
            var dateUtc = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            return await _dbSet.AnyAsync(r =>
                r.SalleId == salleId &&
                r.Evenement.DateEvenement.Date == dateUtc &&
                r.Session == session &&
                r.Statut != "Annulée");
        }
    }
}
