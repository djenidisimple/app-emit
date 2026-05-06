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

        // Note : Les filtres Parcours/Niveau/Étudiant ne sont pas disponibles car
        // l'entité SeanceCours n'a pas de lien direct avec ces concepts.
        // Ils pourront être ajoutés ultérieurement via une évolution du modèle.
    }
}