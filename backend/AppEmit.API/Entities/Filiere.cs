using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.Entities;

public class Filiere
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    // Navigation
    public virtual ICollection<Parcours> Parcours { get; set; } = new HashSet<Parcours>();
}
