using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.Entities;

public class Role
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Relations
    public virtual ICollection<Utilisateur> Utilisateurs { get; set; } = new List<Utilisateur>();
    public virtual ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}
