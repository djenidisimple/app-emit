using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppEmit.API.Entities;

public class Paiement
{
    [Key]
    public int Id { get; set; }

    public int ReservationId { get; set; }
    [ForeignKey("ReservationId")]
    public virtual Reservation Reservation { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Montant { get; set; }

    public DateTime DatePaiement { get; set; }

    [Required, StringLength(50)]
    public string MethodePaiement { get; set; } = string.Empty;
}
