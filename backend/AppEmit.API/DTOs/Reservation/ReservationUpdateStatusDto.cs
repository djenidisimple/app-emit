namespace AppEmit.API.DTOs.Reservation
{
    public class ReservationUpdateStatusDto
    {
        public string Statut { get; set; } = string.Empty;
    }

    public class ReservationActionDto
    {
        public int Id { get; set; }
        public string Statut { get; set; } = string.Empty;
    }
}
