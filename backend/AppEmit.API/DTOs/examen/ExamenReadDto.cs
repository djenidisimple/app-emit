using System.Text.Json.Serialization;

namespace AppEmit.API.DTOs.Examen
{
    public class ExamenReadDto
    {
        public int Id { get; set; }
        public int MatiereId { get; set; }
        [JsonPropertyName("matiereNom")]
        public string MatiereNom { get; set; } = string.Empty;
        [JsonPropertyName("matiereCode")]
        public string MatiereCode { get; set; } = string.Empty;
        public int ProfesseurId { get; set; }
        [JsonPropertyName("professeurNom")]
        public string ProfesseurNom { get; set; } = string.Empty;
        public int SalleId { get; set; }
        [JsonPropertyName("salleNom")]
        public string SalleNom { get; set; } = string.Empty;
        public int? ParcoursId { get; set; }
        public int? NiveauId { get; set; }
        public DateTime DateExamen { get; set; }
        [JsonPropertyName("heureDebut")]
        public string HeureDebut { get; set; } = string.Empty;
        [JsonPropertyName("heureFin")]
        public string HeureFin { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
