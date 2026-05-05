using System.ComponentModel.DataAnnotations;

namespace AppEmit.DTOs.Reservation;

public class ReservationUpdateStatutDto
{
    [Required]
    public int ReservationId { get; set; }

    [Required]
    public string NouveauStatut { get; set; } = string.Empty; // Approuvé, Rejeté

    public string? MotifRejet { get; set; }
}