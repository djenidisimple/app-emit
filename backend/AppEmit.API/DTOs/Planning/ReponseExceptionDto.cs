using System;

namespace AppEmit.API.DTOs
{
    public class ReponseExceptionDto
    {
        public int Id { get; set; }
        public int SeanceCoursId { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
        public string TypeException { get; set; } = string.Empty;
        public string? Motif { get; set; }
        public int? NouvelleSalleId { get; set; }
        public DateTime DateCreation { get; set; }
    }
}
