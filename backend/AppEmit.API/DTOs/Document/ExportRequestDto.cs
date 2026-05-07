namespace AppEmit.API.DTOs.Document
{
    public class ExportRequestDto
    {
        public string Format { get; set; } = "pdf"; // pdf | excel
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public int? ProfesseurId { get; set; }
        public int? SalleId { get; set; }
    }
}