namespace AppEmit.DTOs.Reservation;

public class ReservationDto
{
    public int Id { get; set; }
    public string Titre { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime DatePrecise { get; set; }
    public string Session { get; set; } = string.Empty;
    public string Statut { get; set; } = string.Empty;
    public int DemandeurId { get; set; }
    public string DemandeurNom { get; set; } = string.Empty;
    public string DemandeurPrenom { get; set; } = string.Empty;
    public int SalleId { get; set; }
    public string SalleLibelle { get; set; } = string.Empty;
}