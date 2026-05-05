using AppEmit.Entities;
using AppEmit.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.Repositories;

public class ReservationRepository : GenericRepository<EvenementReservation>, IReservationRepository
{
    public ReservationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<EvenementReservation>> GetReservationsByDemandeurAsync(int demandeurId)
    {
        return await _dbSet
            .Include(r => r.Demandeur)
            .Include(r => r.Salle)
            .Where(r => r.DemandeurId == demandeurId)
            .OrderByDescending(r => r.DatePrecise)
            .ToListAsync();
    }

    public async Task<IEnumerable<EvenementReservation>> GetReservationsEnAttenteAsync()
    {
        return await _dbSet
            .Include(r => r.Demandeur)
            .Include(r => r.Salle)
            .Where(r => r.Statut == "En attente")
            .OrderBy(r => r.DatePrecise)
            .ToListAsync();
    }

    public async Task<bool> IsSalleDisponibleAsync(int salleId, DateTime date, string session, int? excludeReservationId = null)
    {
        var query = _dbSet.Where(r => r.SalleId == salleId 
                                    && r.DatePrecise.Date == date.Date 
                                    && r.Session == session
                                    && r.Statut == "Approuvé"); // Seules les réservations approuvées bloquent

        if (excludeReservationId.HasValue)
        {
            query = query.Where(r => r.Id != excludeReservationId.Value);
        }

        return !await query.AnyAsync();
    }

    public async Task<IEnumerable<EvenementReservation>> GetReservationsWithDetailsAsync()
    {
        return await _dbSet
            .Include(r => r.Demandeur)
            .Include(r => r.Salle)
            .OrderByDescending(r => r.DatePrecise)
            .ToListAsync();
    }
}