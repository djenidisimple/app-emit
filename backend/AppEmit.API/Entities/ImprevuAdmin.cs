// Entities/ImprevuAdmin.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Framework;

namespace AppEmit.Entities;

/// <summary>
/// Trace chaque action d'annulation/modification effectuée par un administrateur.
/// Permet l'audit et la traçabilité des décisions prises en urgence.
/// </summary>
public class ImprevuAdmin
{
    [Key]
    public int Id { get; set; }

    /// <summary>Type d'action : Annulation, Report, ChangementSalle, Indisponibilite</summary>
    [Required, StringLength(50)]
    public string TypeAction { get; set; } = "Annulation";

    /// <summary>Séance concernée</summary>
    [Required]
    public int SeanceCoursId { get; set; }
    public virtual SeanceCours SeanceCours { get; set; } = null!;

    /// <summary>Admin qui a déclenché l'action</summary>
    [Required]
    public int AdminId { get; set; }
    public virtual Utilisateur Admin { get; set; } = null!;

    /// <summary>Date/heure de l'action</summary>
    public DateTime DateAction { get; set; } = DateTime.UtcNow;

    /// <summary>Motif saisi par l'admin</summary>
    public string? Motif { get; set; }

    /// <summary>Date de début de l'impact</summary>
    [Required]
    public DateTime DateDebut { get; set; }

    /// <summary>Date de fin (null = indéfini)</summary>
    public DateTime? DateFin { get; set; }

    /// <summary>Nouvelle salle en cas de déplacement</summary>
    public int? NouvelleSalleId { get; set; }
    public virtual Salle? NouvelleSalle { get; set; }

    /// <summary>Référence à l'ExceptionPlanning créée</summary>
    public int? ExceptionPlanningId { get; set; }
    public virtual ExceptionPlanning? ExceptionPlanning { get; set; }
}