namespace AppEmit.API.DTOs.Document
{
    public class EmploiDuTempsExportDto
    {
        public int? SalleId { get; set; }
        public int? NiveauId { get; set; }
        public int? ParcoursId { get; set; }
        public int? FiliereId { get; set; }
        public string AnneeUniversitaire { get; set; } = "2025-2026";
        public string? Mention { get; set; }
        public string? ParcoursNom { get; set; }
        public string? NiveauCode { get; set; }
        public string? SalleCode { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
    }
}
