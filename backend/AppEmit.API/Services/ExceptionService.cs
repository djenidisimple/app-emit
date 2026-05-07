using AppEmit.API.DTOs;
using AppEmit.API.Interfaces;
using AppEmit.Entities;
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
            // Vérifier que la séance existe
            var seance = await _seanceRepo.GetSeanceByIdAsync(dto.SeanceCoursId);
            if (seance == null)
                throw new Exception("Séance non trouvée");

            // Vérifier que la date de début est dans la période de la séance
            if (dto.DateDebut < seance.DateDebutAnnee || dto.DateDebut > seance.DateFinAnnee)
                throw new Exception("La date d'annulation est hors de la période du cours");

            // Créer l'exception
            var exception = new ExceptionPlanning
            {
                SeanceCoursId = dto.SeanceCoursId,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                TypeException = "Annulation",
                Motif = dto.Motif,
                NouvelleSalleId = null
            };

            _exceptionRepo.Add(exception); // besoin d'une méthode Add dans le repo
            await _exceptionRepo.SaveChangesAsync();

            // Envoyer les notifications
            await EnvoyerNotificationsPourSeance(seance, $"Cours annulé du {dto.DateDebut:dd/MM/yyyy} : {dto.Motif}");

            return MapToDto(exception);
        }

        public async Task<ReponseExceptionDto> ReporterCoursAsync(CreerExceptionDto dto)
        {
            var seance = await _seanceRepo.GetSeanceByIdAsync(dto.SeanceCoursId);
            if (seance == null)
                throw new Exception("Séance non trouvée");

            if (!dto.NouvelleSalleId.HasValue)
                throw new Exception("Nouvelle salle obligatoire pour un report");

            var nouvelleSalle = await _salleRepo.GetByIdAsync(dto.NouvelleSalleId.Value);
            if (nouvelleSalle == null)
                throw new Exception("Salle de destination inexistante");

            var exception = new ExceptionPlanning
            {
                SeanceCoursId = dto.SeanceCoursId,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                TypeException = "Report",
                Motif = dto.Motif,
                NouvelleSalleId = dto.NouvelleSalleId
            };

            _exceptionRepo.Add(exception);
            await _exceptionRepo.SaveChangesAsync();

            await EnvoyerNotificationsPourSeance(seance, $"Cours reporté en salle {nouvelleSalle.Libelle} à partir du {dto.DateDebut:dd/MM/yyyy} : {dto.Motif}");

            return MapToDto(exception);
        }

        public async Task<ReponseExceptionDto> RendreIndisponibleAsync(CreerExceptionDto dto)
        {
            var seance = await _seanceRepo.GetSeanceByIdAsync(dto.SeanceCoursId);
            if (seance == null)
                throw new Exception("Séance non trouvée");

            var exception = new ExceptionPlanning
            {
                SeanceCoursId = dto.SeanceCoursId,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin, // peut être null (indéfini)
                TypeException = "Indisponibilité",
                Motif = dto.Motif,
                NouvelleSalleId = null
            };

            _exceptionRepo.Add(exception);
            await _exceptionRepo.SaveChangesAsync();

            await EnvoyerNotificationsPourSeance(seance, $"Indisponibilité annoncée à partir du {dto.DateDebut:dd/MM/yyyy} : {dto.Motif}");

            return MapToDto(exception);
        }

        private async Task EnvoyerNotificationsPourSeance(SeanceCours seance, string message)
        {
            // Notifier le professeur
            var prof = await _utilisateurRepo.GetProfesseurBySeanceAsync(seance.Id);
            if (prof != null)
                await _notificationService.EnvoyerNotificationAsync(prof.Id, message);

            // Notifier les étudiants (TODO : à implémenter après ajout du lien Parcours/Niveau)
            // var etudiants = await _utilisateurRepo.GetEtudiantsBySeanceAsync(seance.Id);
            // await _notificationService.EnvoyerNotificationsBulkAsync(etudiants.Select(e => e.Id).ToList(), message);
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