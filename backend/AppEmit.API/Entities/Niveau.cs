using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class Niveau
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(10)]
    public string Code { get; set; } = string.Empty; // Ex: L1, L2, L3

    [Required]
    public int ParcoursId { get; set; }

    [ForeignKey("ParcoursId")]
    public virtual Parcours Parcours { get; set; } = null!;

    // Relations
    public virtual ICollection<Utilisateur> Utilisateurs { get; set; } = new HashSet<Utilisateur>();
    public virtual ICollection<SeanceCours> Seances { get; set; } = new HashSet<SeanceCours>();
}
