using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.Examen
{
    public class ExamenCreateDto
    {
        [Required]
        public int MatiereId { get; set; }

        [Required]
        public int ProfesseurId { get; set; }

        [Required]
        public int SalleId { get; set; }

        public int? ParcoursId { get; set; }

        public int? NiveauId { get; set; }

        [Required]
        public DateTime DateExamen { get; set; }

        [Required]
        public string HeureDebut { get; set; } = "08:00";

        [Required]
        public string HeureFin { get; set; } = "10:00";

        public string? Description { get; set; }
    }
}
