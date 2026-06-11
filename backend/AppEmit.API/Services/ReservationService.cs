using AutoMapper;
using AppEmit.API.DTOs.Reservation;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IGenericRepository<Evenement> _evenementRepository;
        private readonly IGenericRepository<Salle> _salleRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly ILogger<ReservationService> _logger;

        public ReservationService(
            IReservationRepository reservationRepository,
            IGenericRepository<Evenement> evenementRepository,
            IGenericRepository<Salle> salleRepository,
            INotificationService notificationService,
            IMapper mapper,
            ILogger<ReservationService> logger)
        {
            _reservationRepository = reservationRepository;
            _evenementRepository = evenementRepository;
            _salleRepository = salleRepository;
            _notificationService = notificationService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ReservationReadDto>> GetAllAsync()
        {
            var reservations = await _reservationRepository.GetAllWithIncludesAsync();
            return _mapper.Map<IEnumerable<ReservationReadDto>>(reservations);
        }

        public async Task<ReservationReadDto?> GetByIdAsync(int id)
        {
            var reservation = await _reservationRepository.GetByIdWithIncludesAsync(id);
            return reservation == null ? null : _mapper.Map<ReservationReadDto>(reservation);
        }

        public async Task<IEnumerable<ReservationReadDto>> GetByUserAsync(int utilisateurId)
        {
            var reservations = await _reservationRepository.GetReservationsByUserAsync(utilisateurId);
            return _mapper.Map<IEnumerable<ReservationReadDto>>(reservations);
        }

        public async Task<IEnumerable<ReservationReadDto>> GetByStatutAsync(string statut)
        {
            var reservations = await _reservationRepository.GetReservationsByStatutAsync(statut);
            return _mapper.Map<IEnumerable<ReservationReadDto>>(reservations);
        }

        public async Task<ReservationReadDto> CreateAsync(int demandeurId, ReservationCreateDto dto)
        {
            var salle = await _salleRepository.GetByIdAsync(dto.SalleId);
            if (salle == null)
                throw new NotFoundException("Salle non trouvée.");

            var conflit = await _reservationRepository.HasConflictAsync(dto.SalleId, dto.DatePrecise, dto.Session);
            if (conflit)
                throw new BadRequestException("Cette salle est déjà réservée pour ce créneau.");

            var evenement = new Evenement
            {
                Nom = dto.Titre,
                Description = dto.Type,
                DateEvenement = dto.DatePrecise,
                OrganisateurId = demandeurId
            };
            var createdEvenement = await _evenementRepository.AddAsync(evenement);

            var reservation = new Reservation
            {
                UtilisateurId = demandeurId,
                EvenementId = createdEvenement.Id,
                SalleId = dto.SalleId,
                DateReservation = DateTime.UtcNow,
                Session = dto.Session,
                Statut = "En attente"
            };
            var createdReservation = await _reservationRepository.AddAsync(reservation);

            _logger.LogInformation("Réservation {Id} créée par l'utilisateur {UserId}", createdReservation.Id, demandeurId);

            return _mapper.Map<ReservationReadDto>(createdReservation);
        }

        public async Task<ReservationReadDto?> UpdateStatutAsync(int id, string statut)
        {
            var reservation = await _reservationRepository.GetByIdWithIncludesAsync(id);
            if (reservation == null)
                throw new NotFoundException("Réservation non trouvée.");

            if (statut != "Confirmée" && statut != "Annulée")
                throw new BadRequestException("Le statut doit être 'Confirmée' ou 'Annulée'.");

            reservation.Statut = statut;
            await _reservationRepository.UpdateAsync(reservation);

            var message = statut == "Confirmée"
                ? $"Votre réservation pour '{reservation.Evenement.Nom}' a été confirmée."
                : $"Votre réservation pour '{reservation.Evenement.Nom}' a été refusée.";

            await _notificationService.CreateAsync(
                new DTOs.Notification.NotificationCreateDto
                {
                    UtilisateurId = reservation.UtilisateurId,
                    Message = message
                });

            _logger.LogInformation("Réservation {Id} {Statut}", id, statut);

            return _mapper.Map<ReservationReadDto>(reservation);
        }
    }
}
