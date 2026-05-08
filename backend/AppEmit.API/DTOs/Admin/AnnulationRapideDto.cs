// DTOs/Admin/AnnulationRapideDto.cs
namespace AppEmit.API.DTOs.Admin;

/// <summary>
/// DTO pour le bouton d'annulation rapide d'un cours par l'administrateur.
/// Conçu pour être appelé en un clic depuis l'interface admin.
/// </summary>
public class AnnulationRapideDto
{
    /// <summary>Séance à annuler (obligatoire)</summary>
    public int SeanceCoursId { get; set; }

    /// <summary>Date du cours à annuler (une occurrence précise)</summary>
    public DateTime DateOccurrence { get; set; }

    /// <summary>Motif (optionnel mais recommandé pour les notifications)</summary>
    public string? Motif { get; set; }

    /// <summary>Si true : annule TOUTES les occurrences restantes de l'année</summary>
    public bool AnnulationDefinitive { get; set; } = false;

    /// <summary>ID de l'admin déclencheur (extrait du JWT côté service)</summary>
    public int AdminId { get; set; }
}

// DTOs/Admin/ReportCoursDto.cs
namespace AppEmit.API.DTOs.Admin;

public class ReportCoursDto
{
    public int SeanceCoursId { get; set; }
    public DateTime DateOccurrence { get; set; }     // Occurrence à reporter
    public DateTime? NouvelleDateOccurrence { get; set; } // Si date change
    public int? NouvelleSalleId { get; set; }        // Si salle change
    public string? Motif { get; set; }
    public int AdminId { get; set; }
}

// DTOs/Admin/ImprevuResponseDto.cs
namespace AppEmit.API.DTOs.Admin;

public class ImprevuResponseDto
{
    public int Id { get; set; }
    public string TypeAction { get; set; } = string.Empty;
    public int SeanceCoursId { get; set; }
    public string MatiereNom { get; set; } = string.Empty;
    public string ProfesseurNom { get; set; } = string.Empty;
    public string SalleCode { get; set; } = string.Empty;
    public DateTime DateAction { get; set; }
    public string? Motif { get; set; }
    public DateTime DateDebut { get; set; }
    public DateTime? DateFin { get; set; }
    public int NombreNotificationsEnvoyees { get; set; }
}

// DTOs/Admin/StatAdminDto.cs
namespace AppEmit.API.DTOs.Admin;

/// <summary>Statistiques pour le tableau de bord administration</summary>
public class StatAdminDto
{
    public int TotalSalles { get; set; }
    public int SallesActives { get; set; }
    public int TotalProfesseurs { get; set; }
    public int TotalEtudiants { get; set; }
    public int TotalMatieres { get; set; }
    public int TotalParcours { get; set; }
    public int TotalFilieres { get; set; }
    public int TotalNiveaux { get; set; }
    public int CoursAnnulesAujourdhui { get; set; }
    public int CoursReportesAujourdhui { get; set; }
    public int NotificationsEnvoyeesAujourdhui { get; set; }
}

// DTOs/Admin/Referentiel — DTOs pour les tables du référentiel
// DTOs/Admin/Referentiel/FiliereDto.cs
namespace AppEmit.API.DTOs.Admin.Referentiel;

public class FiliereCreateDto
{
    public string Nom { get; set; } = string.Empty;
}

public class FiliereReadDto
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public int NombreParcours { get; set; }
}

// DTOs/Admin/Referentiel/NiveauDto.cs
namespace AppEmit.API.DTOs.Admin.Referentiel;

public class NiveauCreateDto
{
    public string Code { get; set; } = string.Empty; // L1, L2, M1...
    public int ParcoursId { get; set; }
}

public class NiveauReadDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public int ParcoursId { get; set; }
    public string ParcoursNom { get; set; } = string.Empty;
    public string FiliereNom { get; set; } = string.Empty;
}

// DTOs/Admin/Referentiel/UtilisateurAdminDto.cs
namespace AppEmit.API.DTOs.Admin.Referentiel;

public class UtilisateurCreateDto
{
    public string Matricule { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MotDePasse { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Admin, Professeur, Etudiant
    public int? NiveauId { get; set; } // Pour les étudiants
}

public class UtilisateurReadDto
{
    public int Id { get; set; }
    public string Matricule { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}