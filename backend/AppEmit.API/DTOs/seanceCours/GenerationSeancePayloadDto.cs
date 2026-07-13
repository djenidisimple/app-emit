using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.SeanceCours
{
    public class GenerationSeancePayloadDto
    {
        public int ParcoursId { get; set; }

        public int? NiveauId { get; set; }

        [Required]
        public int MatiereId { get; set; }

        [Required]
        public int ProfId { get; set; }

        [Required]
        public int SalleId { get; set; }

        [Required]
        public int CreneauId { get; set; }

        [Required]
        public DateTime DateDebut { get; set; }

        [Required]
        public DateTime DateFin { get; set; }

        public string? CouleurAffichage { get; set; }
        public TimeSpan? HeureDebutCustom { get; set; }
        public TimeSpan? HeureFinCustom { get; set; }
    }
}
