using System;

namespace AppEmit.API.DTOs
{
    public class PlanningHebdoRequestDto
    {
        /// <summary>Date de référence (ex: 2026-05-11). On calculera le lundi de la semaine.</summary>
        public DateTime StartDate { get; set; }

        /// <summary>Filtrer par professeur (ProfesseurId dans SeanceCours)</summary>
        public int? ProfesseurId { get; set; }

        /// <summary>Filtrer par salle</summary>
        public int? SalleId { get; set; }

        /// <summary>Filtrer par niveau d'étude</summary>
        public int? NiveauId { get; set; }

        /// <summary>Filtrer par parcours</summary>
        public int? ParcoursId { get; set; }
    }
}
