using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class SeanceCours
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

    [Required]
    public int CreneauId { get; set; }
    [ForeignKey("CreneauId")]
    public Creneau Creneau { get; set; } = null!;

    public int? NiveauId { get; set; }
    [ForeignKey("NiveauId")]
    public Niveau? Niveau { get; set; }

    public DateTime DateDebutAnnee { get; set; }
    public DateTime DateFinAnnee { get; set; }
    
    public bool EstTerminee { get; set; } = false;

    public string? CouleurAffichage { get; set; }

    // Lien vers les annulations/reports
    public ICollection<ExceptionPlanning> Exceptions { get; set; } = new List<ExceptionPlanning>();
}
