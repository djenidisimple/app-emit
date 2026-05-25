using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.Entities;

public class Salle
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(20)]
    public string CodeSalle { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Libelle { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required]
    public int Capacite { get; set; }

    public string? Equipements { get; set; }

    public bool EstActive { get; set; } = true;

    public bool EstDisponible { get; set; } = true;

    [StringLength(20)]
    public string? Type { get; set; }

    // Relations
    public ICollection<SeanceCours> Seances { get; set; } = new List<SeanceCours>();
}
