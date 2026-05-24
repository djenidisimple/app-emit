// Interfaces/Admin/IAdminImprevuService.cs
using AppEmit.API.DTOs.Admin;

namespace AppEmit.API.Interfaces.Admin;

/// <summary>
/// Service métier pour la gestion des imprévus.
/// Orchestre : ExceptionPlanning + Notifications + Audit (ImprevuAdmin).
/// </summary>
public interface IAdminImprevuService
{
    /// <summary>Annulation rapide d'une occurrence de cours (un seul clic).</summary>
    Task<ImprevuResponseDto> AnnulationRapideAsync(AnnulationRapideDto dto);

    /// <summary>Report d'une occurrence vers une autre salle et/ou date.</summary>
    Task<ImprevuResponseDto> ReporterCoursAsync(ReportCoursDto dto);

    /// <summary>Historique paginé des actions d'imprévus.</summary>
    Task<IEnumerable<ImprevuResponseDto>> GetHistoriqueAsync(int page = 1, int pageSize = 20);

    /// <summary>Annuler un imprévu enregistré (restaurer la séance).</summary>
    Task<bool> AnnulerImprevuAsync(int imprevuId);
}

// Interfaces/Admin/IReferentielService.cs
using AppEmit.API.DTOs.Admin.Referentiel;
using AppEmit.API.DTOs.Matiere;
using AppEmit.API.DTOs.Parcours;

namespace AppEmit.API.Interfaces.Admin;

/// <summary>
/// Service de gestion du référentiel universitaire (tables maîtres).
/// Couvre : Filières, Parcours, Niveaux, Matières, Utilisateurs.
/// </summary>
public interface IReferentielService
{
    // ── Filières ──────────────────────────────────────────────
    Task<IEnumerable<FiliereReadDto>> GetFilieresAsync();
    Task<FiliereReadDto> CreateFiliereAsync(FiliereCreateDto dto);
    Task<FiliereReadDto?> UpdateFiliereAsync(int id, FiliereCreateDto dto);
    Task<bool> DeleteFiliereAsync(int id);

    // ── Niveaux ───────────────────────────────────────────────
    Task<IEnumerable<NiveauReadDto>> GetNiveauxAsync(int? parcoursId = null);
    Task<NiveauReadDto> CreateNiveauAsync(NiveauCreateDto dto);
    Task<NiveauReadDto?> UpdateNiveauAsync(int id, NiveauCreateDto dto);
    Task<bool> DeleteNiveauAsync(int id);

    // ── Utilisateurs ──────────────────────────────────────────
    Task<IEnumerable<UtilisateurReadDto>> GetUtilisateursAsync(string? role = null);
    Task<UtilisateurReadDto> CreateUtilisateurAsync(UtilisateurCreateDto dto);
    Task<bool> DeleteUtilisateurAsync(int id);
    Task<bool> UpdateRoleAsync(int id, string nouveauRole);
}

// Interfaces/Admin/IAdminStatsService.cs
using AppEmit.API.DTOs.Admin;

namespace AppEmit.API.Interfaces.Admin;

public interface IAdminStatsService
{
    Task<StatAdminDto> GetStatistiquesAsync();
}