using System;

namespace AppEmit.API.DTOs
{
    public class CreerExceptionDto
    {
        public int SeanceCoursId { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime? DateFin { get; set; } // null = indéfini
        public string TypeException { get; set; } = string.Empty; // "Annulation", "Report", "Indisponibilite"
        public string? Motif { get; set; }
        public int? NouvelleSalleId { get; set; } // utile pour Report
    }
}