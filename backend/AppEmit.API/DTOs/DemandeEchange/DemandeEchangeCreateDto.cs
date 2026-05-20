using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.DemandeEchange
{
    public class DemandeEchangeCreateDto
    {
        [Required]
        public int DemandeurId { get; set; }

        [Required]
        public int CibleId { get; set; }

        [Required]
        public int SeanceDemandeurId { get; set; }

        [Required]
        public int SeanceCibleId { get; set; }

        public string? Motif { get; set; }
    }
}