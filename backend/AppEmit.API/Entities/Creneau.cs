using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities
{
    public class Creneau
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Jour { get; set; } = string.Empty; // Lundi, Mardi...
        [Required]
        public TimeSpan HeureDebut { get; set; }
        [Required]
        public TimeSpan HeureFin { get; set; }

        public DateTime? Date { get; set; }
    }
}
