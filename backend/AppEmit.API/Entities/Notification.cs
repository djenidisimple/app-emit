using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UtilisateurId { get; set; }

    [ForeignKey("UtilisateurId")]
    public virtual Utilisateur Utilisateur { get; set; } = null!;

    [Required]
    public string Message { get; set; } = string.Empty;

    public DateTime DateEnvoi { get; set; } = DateTime.UtcNow;

    public bool EstLu { get; set; } = false;
}