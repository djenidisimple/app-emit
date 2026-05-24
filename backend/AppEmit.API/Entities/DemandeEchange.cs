using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities
{
    public class DemandeEchange
    {
        [Key]
        public int Id { get; set; }

        // Professeur qui fait la demande
        [Required]
        public int DemandeurId { get; set; }
        [ForeignKey("DemandeurId")]
        public Utilisateur Demandeur { get; set; } = null!;

        // Professeur cible de l'échange
        [Required]
        public int CibleId { get; set; }
        [ForeignKey("CibleId")]
        public Utilisateur Cible { get; set; } = null!;

        // Séance que le demandeur veut échanger
        [Required]
        public int SeanceDemandeurId { get; set; }
        [ForeignKey("SeanceDemandeurId")]
        public SeanceCours SeanceDemandeur { get; set; } = null!;

        // Séance de la cible proposée en échange
        [Required]
        public int SeanceCibleId { get; set; }
        [ForeignKey("SeanceCibleId")]
        public SeanceCours SeanceCible { get; set; } = null!;

        // EnAttente | Acceptee | Refusee
        [Required, StringLength(20)]
        public string Statut { get; set; } = "EnAttente";

        public string? Motif { get; set; }

        public DateTime DateDemande { get; set; } = DateTime.UtcNow;
        public DateTime? DateReponse { get; set; }
    }
}
}