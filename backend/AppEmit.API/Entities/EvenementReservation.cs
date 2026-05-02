using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.Entities;

public class EvenementReservation
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(200)]
    public string Titre { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty; // Ex: Club, Conférence

    [Required]
    public DateTime DatePrecise { get; set; }

    public string Session { get; set; } = string.Empty; // Matin / Après-midi

    [Required]
    public string Statut { get; set; } = "En attente";

    [Required]
    public int DemandeurId { get; set; }

    [ForeignKey("DemandeurId")]
    public virtual Utilisateur Demandeur { get; set; } = null!;

    [Required]
    public int SalleId { get; set; }

    [ForeignKey("SalleId")]
    public virtual Salle Salle { get; set; } = null!;
}