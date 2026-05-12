using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.Entities;

public class Permission
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Relations
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
