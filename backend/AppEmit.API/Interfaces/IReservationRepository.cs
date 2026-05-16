using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces
{
    public interface IReservationRepository : IGenericRepository<Reservation>
    {
        Task<IEnumerable<Reservation>> GetReservationsByUserAsync(int utilisateurId);
        Task<IEnumerable<Reservation>> GetReservationsByStatutAsync(string statut);
        Task<IEnumerable<Reservation>> GetAllWithIncludesAsync();
        Task<Reservation?> GetByIdWithIncludesAsync(int id);
    }
}
