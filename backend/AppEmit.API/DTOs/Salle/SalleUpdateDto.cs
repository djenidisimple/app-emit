using System.ComponentModel.DataAnnotations;

namespace AppEmit.DTOs.Salle
{
    public class SalleUpdateDto
    {
        [Required]
        public int Id { get; set; }

        [Required(ErrorMessage = "Le code de la salle est requis")]
        [StringLength(20, ErrorMessage = "Le code ne peut pas dépasser 20 caractères")]
        public string CodeSalle { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le libellé est requis")]
        [StringLength(100, ErrorMessage = "Le libellé ne peut pas dépasser 100 caractères")]
        public string Libelle { get; set; } = string.Empty;

        [Required(ErrorMessage = "La capacité est requise")]
        [Range(1, 500, ErrorMessage = "La capacité doit être entre 1 et 500")]
        public int Capacite { get; set; }

        public string? Equipements { get; set; }

        public bool EstActive { get; set; } = true;
    }
}