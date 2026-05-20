using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.SeanceCours
{
    public class SeanceCoursCreateDto
    {
        [Required]
        public int ProfesseurId { get; set; }  // corrigé : ProfId → ProfesseurId

        [Required]
        public int MatiereId { get; set; }

        [Required]
        public int SalleId { get; set; }

        [Required]
        public int CreneauId { get; set; }

        public int? NiveauId { get; set; }

        [Required]
        public DateTime DateDebutAnnee { get; set; }

        [Required]
        public DateTime DateFinAnnee { get; set; }

        public string CouleurAffichage { get; set; } = "#3B82F6";
    }
}