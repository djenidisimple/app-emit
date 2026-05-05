using AppEmit.DTOs.Reservation;

namespace AppEmit.Interfaces;

public interface IReservationService
{
    Task<IEnumerable<ReservationDto>> GetReservationsByUserAsync(int userId);
    Task<IEnumerable<ReservationDto>> GetAllReservationsAsync();
    Task<IEnumerable<ReservationDto>> GetReservationsEnAttenteAsync();
    Task<ReservationDto?> GetReservationByIdAsync(int id);
    Task<ReservationDto> CreateReservationAsync(int demandeurId, ReservationCreateDto dto);
    Task<ReservationDto?> UpdateStatutAsync(ReservationUpdateStatutDto dto, int adminId);
    Task<bool> CancelReservationAsync(int reservationId, int demandeurId);
}