using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class Evenement
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(200)]
    public string Nom { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime DateEvenement { get; set; }

    public int OrganisateurId { get; set; }
    [ForeignKey("OrganisateurId")]
    public virtual Utilisateur Organisateur { get; set; } = null!;

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
