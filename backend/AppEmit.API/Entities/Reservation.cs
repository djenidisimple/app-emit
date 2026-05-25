using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class Reservation
{
    [Key]
    public int Id { get; set; }

    public int UtilisateurId { get; set; }
    [ForeignKey("UtilisateurId")]
    public virtual Utilisateur Utilisateur { get; set; } = null!;

    public int EvenementId { get; set; }
    [ForeignKey("EvenementId")]
    public virtual Evenement Evenement { get; set; } = null!;

    public int SalleId { get; set; }
    [ForeignKey("SalleId")]
    public virtual Salle Salle { get; set; } = null!;

    public DateTime DateReservation { get; set; }

    [StringLength(50)]
    public string? Session { get; set; } // Matin, Après-midi

    [Required, StringLength(50)]
    public string Statut { get; set; } = "En attente"; // En attente, Approuvé, Rejeté

    public virtual ICollection<Paiement> Paiements { get; set; } = new List<Paiement>();
}
