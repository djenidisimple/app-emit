using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.Entities;

public class Utilisateur
{
    [Key]
    public int Id { get; set; }

    [StringLength(20)]
    public string? Matricule { get; set; }

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Prenom { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string MotDePasseHash { get; set; } = string.Empty;

    public DateTime? DateNaissance { get; set; }
    public string? Adresse { get; set; }

    public int? NiveauId { get; set; }
    public virtual Niveau? Niveau { get; set; }

    // Relations
    public ICollection<SeanceCours> SeancesAnimees { get; set; } = new List<SeanceCours>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Evenement> EvenementsOrganises { get; set; } = new List<Evenement>();
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
