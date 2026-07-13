namespace AppEmit.API.DTOs.Document
{
    public class ReservationListExportDto
    {
        public int? SalleId { get; set; }
        public DateTime? DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
        public string? Statut { get; set; }
    }
}
