namespace AppEmit.API.DTOs.Reservation
{
    public class ReservationCreateDto
    {
        public string Titre { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime DatePrecise { get; set; }
        public int DemandeурId { get; set; }
    }
}
