using AppEmit.API.DTOs.Reservation;

namespace AppEmit.API.Interfaces
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationReadDto>> GetAllAsync();
        Task<ReservationReadDto?> GetByIdAsync(int id);
        Task<IEnumerable<ReservationReadDto>> GetByUserAsync(int utilisateurId);
        Task<IEnumerable<ReservationReadDto>> GetByStatutAsync(string statut);
        Task<ReservationReadDto> CreateAsync(int demandeurId, ReservationCreateDto dto);
        Task<ReservationReadDto?> UpdateStatutAsync(int id, string statut);
        Task<IEnumerable<ReservationReadDto>> ObtenirDemandesEnAttenteAsync();
        Task<ReservationReadDto?> ValiderDemandeAsync(int id);
        Task<ReservationReadDto?> RefuserDemandeAsync(int id);
    }
}
