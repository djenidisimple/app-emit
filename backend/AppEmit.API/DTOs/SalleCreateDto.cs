using System.ComponentModel.DataAnnotations;

namespace AppEmit.DTOs
{
    public class SalleCreateDto
    {
        [Required(ErrorMessage = "Le code de la salle est obligatoire")]
        [StringLength(20)]
        public string CodeSalle { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le libellé est obligatoire")]
        [StringLength(100)]
        public string Libelle { get; set; } = string.Empty;

        [Range(1, 500, ErrorMessage = "La capacité doit être comprise entre 1 et 500")]
        public int Capacite { get; set; }

        public string? Equipements { get; set; }
    }
}