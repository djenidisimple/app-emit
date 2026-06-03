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
        private readonly ISalleRepository _salleRepo;
        private readonly IMapper _mapper;

        public PlanningHebdoService(
            ISeanceCoursRepository seanceRepo,
            IExceptionPlanningRepository exceptionRepo,
            ISalleRepository salleRepo,
            IMapper mapper)
        {
            _seanceRepo = seanceRepo;
            _exceptionRepo = exceptionRepo;
            _salleRepo = salleRepo;
            _mapper = mapper;
        }

        public async Task<PlanningHebdoResponseDto> GetPlanningHebdomadaireAsync(PlanningHebdoRequestDto request)
        {
            // 1. Calculer le lundi et samedi de la semaine contenant StartDate
            var startDate = DateTime.SpecifyKind(request.StartDate.Date, DateTimeKind.Unspecified);
            int diff = startDate.DayOfWeek == DayOfWeek.Sunday ? 6 : startDate.DayOfWeek - DayOfWeek.Monday;
            var monday = startDate.AddDays(-diff);
            var saturday = monday.AddDays(5); // samedi

            // 2. Récupérer les séances actives sur la période (avec filtres)
            var seances = await _seanceRepo.GetSeancesForWeekAsync(monday, saturday, request.ProfesseurId, request.SalleId, request.NiveauId);

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
                    var (statut, motif, salleOverride) = await ApplyExceptionsAsync(seance, occDate, exceptions);
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

        private static readonly Dictionary<DayOfWeek, string> DayMapping = new()
        {
            { DayOfWeek.Monday, "Lundi" },
            { DayOfWeek.Tuesday, "Mardi" },
            { DayOfWeek.Wednesday, "Mercredi" },
            { DayOfWeek.Thursday, "Jeudi" },
            { DayOfWeek.Friday, "Vendredi" },
            { DayOfWeek.Saturday, "Samedi" },
            { DayOfWeek.Sunday, "Dimanche" },
        };

        private List<DateTime> GenerateOccurrences(SeanceCours seance, DateTime weekStart, DateTime weekEnd)
        {
            var result = new List<DateTime>();
            var current = weekStart;
            while (current <= weekEnd)
            {
                var dayName = DayMapping.GetValueOrDefault(current.DayOfWeek);
                if (dayName == seance.Creneau?.Jour)
                {
                    if (current >= seance.DateDebutAnnee && current <= seance.DateFinAnnee)
                        result.Add(current);
                }
                current = current.AddDays(1);
            }
            return result;
        }

        private async Task<(string statut, string? motif, Salle? salleOverride)> ApplyExceptionsAsync(
            SeanceCours seance,
            DateTime occurrenceDate,
            List<ExceptionPlanning> exceptions)
        {
            var exc = exceptions.FirstOrDefault(e => e.SeanceCoursId == seance.Id &&
                                                      occurrenceDate >= e.DateDebut &&
                                                      (e.DateFin == null || occurrenceDate < e.DateFin.Value));

            if (exc == null)
                return ("Normal", null, null);

            var salle = exc.NouvelleSalleId.HasValue
                ? await _salleRepo.GetByIdAsync(exc.NouvelleSalleId.Value)
                : null;

            return exc.TypeException switch
            {
                "Annulation" => ("Annulé", exc.Motif, null),
                "Report" => ("Reporté", exc.Motif, salle),
                "Deplacement" => ("Reporté", exc.Motif, salle),
                _ => ("Normal", null, null)
            };
        }
    }
}
