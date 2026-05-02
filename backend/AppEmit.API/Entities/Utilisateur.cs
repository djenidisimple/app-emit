using System.ComponentModel.DataAnnotations;

namespace AppEmit.Entities;

public class Utilisateur
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(20)]
    public string Matricule { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Prenom { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string MotDePasseHash { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Role { get; set; } = string.Empty; // Admin, Professeur, Etudiant

    // Relations
    public ICollection<SeanceCours> SeancesAnimees { get; set; } = new List<SeanceCours>();
    public ICollection<EvenementReservation> Reservations { get; set; } = new List<EvenementReservation>();
}