using AutoMapper;
using AppEmit.API.DTOs;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppEmit.API.Services
{
    public class PlanningHebdoService : IPlanningHebdoService
    {
        private readonly ISeanceCoursRepository _seanceRepo;
        private readonly IExceptionPlanningRepository _exceptionRepo;
        private readonly IMapper _mapper;

        public PlanningHebdoService(
            ISeanceCoursRepository seanceRepo,
            IExceptionPlanningRepository exceptionRepo,
            IMapper mapper)
        {
            _seanceRepo = seanceRepo;
            _exceptionRepo = exceptionRepo;
            _mapper = mapper;
        }

        public async Task<PlanningHebdoResponseDto> GetPlanningHebdomadaireAsync(PlanningHebdoRequestDto request)
        {
            // 1. Calculer le lundi et samedi de la semaine contenant StartDate
            var startDate = request.StartDate.Date;
            int diff = startDate.DayOfWeek == DayOfWeek.Sunday ? 6 : startDate.DayOfWeek - DayOfWeek.Monday;
            var monday = startDate.AddDays(-diff);
            var saturday = monday.AddDays(5); // samedi

            // 2. Récupérer les séances actives sur la période (avec filtres)
            var seances = await _seanceRepo.GetSeancesForWeekAsync(monday, saturday, request.ProfesseurId, request.SalleId);

            // 3. Récupérer les exceptions associées à ces séances
            var seanceIds = seances.Select(s => s.Id).ToList();
            var exceptions = await _exceptionRepo.GetExceptionsForSeancesAsync(seanceIds);

            // 4. Générer les occurrences pour chaque séance
            var resultSeances = new List<SeancePlanningDto>();
            foreach (var seance in seances)
            {
                var occurrences = GenerateOccurrences(seance, monday, saturday);
                foreach (var occDate in occurrences)
                {
                    var (statut, motif, salleOverride) = ApplyExceptions(seance, occDate, exceptions);
                    if (statut == "Annulé")
                        continue; // ne pas ajouter cette occurrence

                    var dto = _mapper.Map<SeancePlanningDto>(seance);
                    dto.DateOccurrence = occDate;
                    dto.Statut = statut;
                    dto.MotifException = motif;
                    
                    if (salleOverride != null)
                        dto.SalleNom = salleOverride.Libelle;

                    resultSeances.Add(dto);
                }
            }

            return new PlanningHebdoResponseDto
            {
                Lundi = monday,
                Samedi = saturday,
                Seances = resultSeances.OrderBy(s => s.DateOccurrence).ThenBy(s => s.HeureDebut).ToList()
            };
        }

        private List<DateTime> GenerateOccurrences(SeanceCours seance, DateTime weekStart, DateTime weekEnd)
        {
            var result = new List<DateTime>();
            var current = weekStart;
            while (current <= weekEnd)
            {
                if (current.DayOfWeek.ToString() == seance.Creneau?.Jour) // ex: "Monday", "Tuesday"
                {
                    if (current >= seance.DateDebutAnnee && current <= seance.DateFinAnnee)
                        result.Add(current);
                }
                current = current.AddDays(1);
            }
            return result;
        }

        private (string statut, string? motif, Salle? salleOverride) ApplyExceptions(
            SeanceCours seance,
            DateTime occurrenceDate,
            List<ExceptionPlanning> exceptions)
        {
            // Chercher une exception qui concerne cette séance et qui couvre la date d'occurrence
            var exc = exceptions.FirstOrDefault(e => e.SeanceCoursId == seance.Id &&
                                                      occurrenceDate >= e.DateDebut &&
                                                      (e.DateFin == null || occurrenceDate < e.DateFin.Value));

            if (exc == null)
                return ("Normal", null, null);

            return exc.TypeException switch
            {
                "Annulation" => ("Annulé", exc.Motif, null),
                "Report" => ("Reporté", exc.Motif, GetSalleById(exc.NouvelleSalleId)),
                "Deplacement" => ("Reporté", exc.Motif, GetSalleById(exc.NouvelleSalleId)),
                _ => ("Normal", null, null)
            };
        }

        // Méthode utilitaire pour récupérer une salle (à injecter via repository si nécessaire)
        // Pour simplifier, on retourne null ici ; tu pourras améliorer en injectant ISalleRepository.
        private Salle? GetSalleById(int? salleId)
        {
            if (!salleId.HasValue) return null;
            // Idéalement appeler un repository. On laisse en attente d'implémentation.
            return null;
        }
    }
}
