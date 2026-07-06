namespace AppEmit.API.DTOs.Document
{
    public class AvisEtudiantExportDto
    {
        public int? NiveauId { get; set; }
        public int? FiliereId { get; set; }
        public string AnneeUniversitaire { get; set; } = "2025-2026";
        public string? Mention { get; set; }
        public List<int>? SeanceIds { get; set; }
        public DateTime? DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
    }
}
