using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.DemandeEchange
{
    public class DemandeEchangeUpdateStatusDto
    {
        [Required]
        [RegularExpression("Acceptee|Refusee",
            ErrorMessage = "Le statut doit être 'Acceptee' ou 'Refusee'")]
        public string Statut { get; set; } = string.Empty;
    }
}