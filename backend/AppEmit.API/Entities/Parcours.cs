using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class Parcours
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public int FiliereId { get; set; }

    [ForeignKey("FiliereId")]
    public virtual Filiere Filiere { get; set; } = null!;

    public virtual ICollection<Niveau> Niveaux { get; set; } = new HashSet<Niveau>();
}
