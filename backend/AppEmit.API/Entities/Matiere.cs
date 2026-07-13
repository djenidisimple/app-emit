using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities
{
    public class Matiere
    {
        [Key]
        public int Id { get; set; }
        [Required, StringLength(20)]
        public string Code { get; set; } = string.Empty;
        [Required]
        public string Nom { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Type { get; set; }

        public int NiveauId { get; set; }

        [ForeignKey("NiveauId")]
        public virtual Niveau Niveau { get; set; } = null!;
    }
}
