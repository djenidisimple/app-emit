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