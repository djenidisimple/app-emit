using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.Entities;

public class ExceptionPlanning
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SeanceCoursId { get; set; }
    [ForeignKey("SeanceCoursId")]
    public SeanceCours SeanceOriginale { get; set; } = null!;

    [Required]
    public DateTime DateDebut { get; set; }
    
    // Si Null, l'annulation est indéterminée
    public DateTime? DateFin { get; set; }

    [Required, StringLength(50)]
    public string TypeException { get; set; } = "Annulation"; // Annulation, Report, Deplacement

    public string? Motif { get; set; }

    public int? NouvelleSalleId { get; set; }
}