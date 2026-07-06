using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class Examen
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MatiereId { get; set; }
    [ForeignKey("MatiereId")]
    public Matiere Matiere { get; set; } = null!;

    [Required]
    public int ProfesseurId { get; set; }
    [ForeignKey("ProfesseurId")]
    public Utilisateur Professeur { get; set; } = null!;

    [Required]
    public int SalleId { get; set; }
    [ForeignKey("SalleId")]
    public Salle Salle { get; set; } = null!;

    public int? ParcoursId { get; set; }
    [ForeignKey("ParcoursId")]
    public Parcours? Parcours { get; set; }

    public int? NiveauId { get; set; }
    [ForeignKey("NiveauId")]
    public Niveau? Niveau { get; set; }

    public DateTime DateExamen { get; set; }

    public TimeSpan HeureDebut { get; set; }

    public TimeSpan HeureFin { get; set; }

    public string? Description { get; set; }
}
