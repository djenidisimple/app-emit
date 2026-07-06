namespace AppEmit.API.DTOs.Examen
{
    public class ExamenUpdateDto
    {
        public int MatiereId { get; set; }
        public int ProfesseurId { get; set; }
        public int SalleId { get; set; }
        public int? ParcoursId { get; set; }
        public int? NiveauId { get; set; }
        public DateTime DateExamen { get; set; }
        public string HeureDebut { get; set; } = "08:00";
        public string HeureFin { get; set; } = "10:00";
        public string? Description { get; set; }
    }
}
