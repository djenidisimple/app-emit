using System.ComponentModel.DataAnnotations;

namespace AppEmit.DTOs.Reservation;

public class ReservationCreateDto
{
    [Required, StringLength(200)]
    public string Titre { get; set; } = string.Empty;

    [Required]
    public DateTime DatePrecise { get; set; }

    [Required]
    public string Session { get; set; } = string.Empty; // Matin / Après-midi

    [Required]
    public int SalleId { get; set; }
}