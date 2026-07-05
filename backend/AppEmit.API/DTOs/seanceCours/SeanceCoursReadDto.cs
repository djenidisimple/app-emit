using System.Text.Json.Serialization;

namespace AppEmit.API.DTOs.SeanceCours
{
    public class SeanceCoursReadDto
    {
        public int Id { get; set; }
        public int MatiereId { get; set; }
        [JsonPropertyName("profId")]
        public int ProfesseurId { get; set; }
        public int SalleId { get; set; }
        public int CreneauId { get; set; }
        public int? ParcoursId { get; set; }
        public int? NiveauId { get; set; }
        public DateTime DateDebutAnnee { get; set; }
        public DateTime DateFinAnnee { get; set; }
        [JsonPropertyName("estTermine")]
        public bool EstTerminee { get; set; }
        public string? CouleurAffichage { get; set; }
    }
}
