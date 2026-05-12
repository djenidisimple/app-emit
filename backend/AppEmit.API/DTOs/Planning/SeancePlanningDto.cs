using System;

namespace AppEmit.API.DTOs
{
    public class SeancePlanningDto
    {
        public int Id { get; set; }
        public string MatiereNom { get; set; } = string.Empty;
        public string MatiereCode { get; set; } = string.Empty;
        public string ProfesseurNomComplet { get; set; } = string.Empty;
        public string SalleNom { get; set; } = string.Empty;
        public string Jour { get; set; } = string.Empty;
        public TimeSpan HeureDebut { get; set; }
        public TimeSpan HeureFin { get; set; }
        public DateTime DateOccurrence { get; set; }
        public string Statut { get; set; } = "Normal"; // "Normal", "Annulé", "Reporté"
        public string? MotifException { get; set; }
    }
}
