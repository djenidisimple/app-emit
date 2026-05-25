using AppEmit.API.DTOs;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;
using System;
using System.Threading.Tasks;

namespace AppEmit.API.Services
{
    public class ExceptionService : IExceptionService
    {
        private readonly ISeanceCoursRepository _seanceRepo;
        private readonly IExceptionPlanningRepository _exceptionRepo;
        private readonly ISalleRepository _salleRepo;
        private readonly INotificationService _notificationService;
        private readonly IUtilisateurRepository _utilisateurRepo;

        public ExceptionService(
            ISeanceCoursRepository seanceRepo,
            IExceptionPlanningRepository exceptionRepo,
            ISalleRepository salleRepo,
            INotificationService notificationService,
            IUtilisateurRepository utilisateurRepo)
        {
            _seanceRepo = seanceRepo;
            _exceptionRepo = exceptionRepo;
            _salleRepo = salleRepo;
            _notificationService = notificationService;
            _utilisateurRepo = utilisateurRepo;
        }

        public async Task<ReponseExceptionDto> AnnulerCoursAsync(CreerExceptionDto dto)
        {
            var seance = await _seanceRepo.GetSeanceByIdAsync(dto.SeanceCoursId);
            if (seance == null)
                throw new Exceptions.NotFoundException("Séance non trouvée");

            if (dto.DateDebut < seance.DateDebutAnnee || dto.DateDebut > seance.DateFinAnnee)
                throw new Exceptions.BadRequestException("La date d'annulation est hors de la période du cours");

            var exception = new ExceptionPlanning
            {
                SeanceCoursId = dto.SeanceCoursId,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                TypeException = "Annulation",
                Motif = dto.Motif,
                NouvelleSalleId = null
            };

            await _exceptionRepo.AddAsync(exception);

            await EnvoyerNotificationsPourSeance(seance, $"Cours annulé du {dto.DateDebut:dd/MM/yyyy} : {dto.Motif}");

            return MapToDto(exception);
        }

        public async Task<ReponseExceptionDto> ReporterCoursAsync(CreerExceptionDto dto)
        {
            var seance = await _seanceRepo.GetSeanceByIdAsync(dto.SeanceCoursId);
            if (seance == null)
                throw new Exceptions.NotFoundException("Séance non trouvée");

            if (!dto.NouvelleSalleId.HasValue)
                throw new Exceptions.BadRequestException("Nouvelle salle obligatoire pour un report");

            var nouvelleSalle = await _salleRepo.GetByIdAsync(dto.NouvelleSalleId.Value);
            if (nouvelleSalle == null)
                throw new Exceptions.NotFoundException("Salle de destination inexistante");

            var exception = new ExceptionPlanning
            {
                SeanceCoursId = dto.SeanceCoursId,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                TypeException = "Report",
                Motif = dto.Motif,
                NouvelleSalleId = dto.NouvelleSalleId
            };

            await _exceptionRepo.AddAsync(exception);

            await EnvoyerNotificationsPourSeance(seance, $"Cours reporté en salle {nouvelleSalle.Libelle} à partir du {dto.DateDebut:dd/MM/yyyy} : {dto.Motif}");

            return MapToDto(exception);
        }

        public async Task<ReponseExceptionDto> RendreIndisponibleAsync(CreerExceptionDto dto)
        {
            var seance = await _seanceRepo.GetSeanceByIdAsync(dto.SeanceCoursId);
            if (seance == null)
                throw new Exceptions.NotFoundException("Séance non trouvée");

            var exception = new ExceptionPlanning
            {
                SeanceCoursId = dto.SeanceCoursId,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                TypeException = "Indisponibilité",
                Motif = dto.Motif,
                NouvelleSalleId = null
            };

            await _exceptionRepo.AddAsync(exception);

            await EnvoyerNotificationsPourSeance(seance, $"Indisponibilité annoncée à partir du {dto.DateDebut:dd/MM/yyyy} : {dto.Motif}");

            return MapToDto(exception);
        }

        private async Task EnvoyerNotificationsPourSeance(SeanceCours seance, string message)
        {
            var prof = await _utilisateurRepo.GetProfesseurBySeanceAsync(seance.Id);
            if (prof != null)
            {
                await _notificationService.CreateAsync(new DTOs.Notification.NotificationCreateDto
                {
                    UtilisateurId = prof.Id,
                    Message = message
                });
            }

            var etudiants = await _utilisateurRepo.GetEtudiantsBySeanceAsync(seance.Id);
            foreach (var etudiant in etudiants)
            {
                await _notificationService.CreateAsync(new DTOs.Notification.NotificationCreateDto
                {
                    UtilisateurId = etudiant.Id,
                    Message = message
                });
            }
        }

        private ReponseExceptionDto MapToDto(ExceptionPlanning e)
        {
            return new ReponseExceptionDto
            {
                Id = e.Id,
                SeanceCoursId = e.SeanceCoursId,
                DateDebut = e.DateDebut,
                DateFin = e.DateFin,
                TypeException = e.TypeException,
                Motif = e.Motif,
                NouvelleSalleId = e.NouvelleSalleId,
                DateCreation = DateTime.UtcNow
            };
        }
    }
}
