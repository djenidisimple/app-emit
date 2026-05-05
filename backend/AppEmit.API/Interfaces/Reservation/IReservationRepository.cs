using AppEmit.Entities;

namespace AppEmit.Interfaces;

public interface IReservationRepository : IGenericRepository<EvenementReservation>
{
    Task<IEnumerable<EvenementReservation>> GetReservationsByDemandeurAsync(int demandeurId);
    Task<IEnumerable<EvenementReservation>> GetReservationsEnAttenteAsync();
    Task<bool> IsSalleDisponibleAsync(int salleId, DateTime date, string session, int? excludeReservationId = null);
    Task<IEnumerable<EvenementReservation>> GetReservationsWithDetailsAsync();
}