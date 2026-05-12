namespace AppEmit.API.DTOs.Reservation
{
    public class ReservationReadDto
    {
        public int Id { get; set; }
        public string Titre { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime DatePrecise { get; set; }
        public string Statut { get; set; } = string.Empty;
        public int DemandeurId { get; set; }
    }
}
