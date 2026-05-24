using AppEmit.DTOs.Reservation;
using AppEmit.Entities;
using AppEmit.Interfaces;
using AppEmit.Mappers;

namespace AppEmit.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ISalleRepository _salleRepository;
    private readonly INotificationRepository _notificationRepository;

    public ReservationService(
        IReservationRepository reservationRepository,
        ISalleRepository salleRepository,
        INotificationRepository notificationRepository)
    {
        _reservationRepository = reservationRepository;
        _salleRepository = salleRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<IEnumerable<ReservationDto>> GetReservationsByUserAsync(int userId)
    {
        var reservations = await _reservationRepository.GetReservationsByDemandeurAsync(userId);
        return reservations.Select(ReservationMapper.ToDto);
    }

    public async Task<IEnumerable<ReservationDto>> GetAllReservationsAsync()
    {
        var reservations = await _reservationRepository.GetReservationsWithDetailsAsync();
        return reservations.Select(ReservationMapper.ToDto);
    }

    public async Task<IEnumerable<ReservationDto>> GetReservationsEnAttenteAsync()
    {
        var reservations = await _reservationRepository.GetReservationsEnAttenteAsync();
        return reservations.Select(ReservationMapper.ToDto);
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(int id)
    {
        var reservation = (await _reservationRepository.GetReservationsWithDetailsAsync())
            .FirstOrDefault(r => r.Id == id);
        return reservation == null ? null : ReservationMapper.ToDto(reservation);
    }

    public async Task<ReservationDto> CreateReservationAsync(int demandeurId, ReservationCreateDto dto)
    {
        // Vérifier si la salle existe
        var salle = await _salleRepository.GetByIdAsync(dto.SalleId);
        if (salle == null)
            throw new Exception("Salle introuvable.");

        // Vérifier la disponibilité
        var isDisponible = await _reservationRepository.IsSalleDisponibleAsync(
            dto.SalleId, dto.DatePrecise, dto.Session);
        
        if (!isDisponible)
            throw new Exception("La salle n'est pas disponible pour ce créneau.");

        var reservation = ReservationMapper.ToEntity(demandeurId, dto);
        var created = await _reservationRepository.AddAsync(reservation);
        
        return ReservationMapper.ToDto(created);
    }

    public async Task<ReservationDto?> UpdateStatutAsync(ReservationUpdateStatutDto dto, int adminId)
    {
        var reservation = await _reservationRepository.GetByIdAsync(dto.ReservationId);
        if (reservation == null)
            return null;

        // Vérifier que l'admin n'approuve pas une salle déjà prise
        if (dto.NouveauStatut == "Approuvé")
        {
            var isDisponible = await _reservationRepository.IsSalleDisponibleAsync(
                reservation.SalleId, reservation.DatePrecise, reservation.Session, reservation.Id);
            
            if (!isDisponible)
                throw new Exception("Cette salle est déjà réservée pour ce créneau.");
        }

        reservation.Statut = dto.NouveauStatut;
        var updated = await _reservationRepository.UpdateAsync(reservation);

        // Créer une notification pour l'étudiant
        var message = dto.NouveauStatut == "Approuvé"
            ? $"Votre réservation '{reservation.Titre}' du {reservation.DatePrecise.ToShortDateString()} a été approuvée."
            : $"Votre réservation '{reservation.Titre}' a été rejetée. Motif : {dto.MotifRejet ?? "Non spécifié"}";

        var notification = new Notification
        {
            UtilisateurId = reservation.DemandeurId,
            Message = message,
            DateEnvoi = DateTime.UtcNow,
            EstLu = false
        };
        await _notificationRepository.AddAsync(notification);

        return ReservationMapper.ToDto(updated);
    }

    public async Task<bool> CancelReservationAsync(int reservationId, int demandeurId)
    {
        var reservation = await _reservationRepository.GetByIdAsync(reservationId);
        if (reservation == null || reservation.DemandeurId != demandeurId)
            return false;

        if (reservation.Statut != "En attente")
            return false; // Seules les demandes en attente peuvent être annulées

        await _reservationRepository.DeleteAsync(reservation);
        return true;
    }
}