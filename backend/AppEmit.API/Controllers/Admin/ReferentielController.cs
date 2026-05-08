// Controllers/Admin/ReferentielController.cs
using AppEmit.API.DTOs.Admin.Referentiel;
using AppEmit.API.Interfaces.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers.Admin;

/// <summary>
/// Gestion du référentiel universitaire : toutes les tables maîtres.
/// Filières, Niveaux, Utilisateurs (CRUD complet).
/// </summary>
[ApiController]
[Route("api/admin/referentiel")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class ReferentielController : ControllerBase
{
    private readonly IReferentielService _referentielService;

    public ReferentielController(IReferentielService referentielService)
        => _referentielService = referentielService;

    // ════════════════════════════════════════════════════
    // FILIÈRES
    // ════════════════════════════════════════════════════

    [HttpGet("filieres")]
    public async Task<IActionResult> GetFilieres()
        => Ok(await _referentielService.GetFilieresAsync());

    [HttpPost("filieres")]
    public async Task<IActionResult> CreateFiliere([FromBody] FiliereCreateDto dto)
    {
        try
        {
            var created = await _referentielService.CreateFiliereAsync(dto);
            return CreatedAtAction(nameof(GetFilieres), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("filieres/{id:int}")]
    public async Task<IActionResult> UpdateFiliere(int id, [FromBody] FiliereCreateDto dto)
    {
        var result = await _referentielService.UpdateFiliereAsync(id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("filieres/{id:int}")]
    public async Task<IActionResult> DeleteFiliere(int id)
    {
        try
        {
            var success = await _referentielService.DeleteFiliereAsync(id);
            return success ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    // ════════════════════════════════════════════════════
    // NIVEAUX
    // ════════════════════════════════════════════════════

    [HttpGet("niveaux")]
    public async Task<IActionResult> GetNiveaux([FromQuery] int? parcoursId = null)
        => Ok(await _referentielService.GetNiveauxAsync(parcoursId));

    [HttpPost("niveaux")]
    public async Task<IActionResult> CreateNiveau([FromBody] NiveauCreateDto dto)
    {
        try { return Ok(await _referentielService.CreateNiveauAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("niveaux/{id:int}")]
    public async Task<IActionResult> UpdateNiveau(int id, [FromBody] NiveauCreateDto dto)
    {
        var result = await _referentielService.UpdateNiveauAsync(id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("niveaux/{id:int}")]
    public async Task<IActionResult> DeleteNiveau(int id)
    {
        try
        {
            var success = await _referentielService.DeleteNiveauAsync(id);
            return success ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    // ════════════════════════════════════════════════════
    // UTILISATEURS
    // ════════════════════════════════════════════════════

    [HttpGet("utilisateurs")]
    public async Task<IActionResult> GetUtilisateurs([FromQuery] string? role = null)
        => Ok(await _referentielService.GetUtilisateursAsync(role));

    [HttpPost("utilisateurs")]
    public async Task<IActionResult> CreateUtilisateur([FromBody] UtilisateurCreateDto dto)
    {
        try { return Ok(await _referentielService.CreateUtilisateurAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("utilisateurs/{id:int}")]
    public async Task<IActionResult> DeleteUtilisateur(int id)
    {
        try
        {
            var success = await _referentielService.DeleteUtilisateurAsync(id);
            return success ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("utilisateurs/{id:int}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] string nouveauRole)
    {
        try
        {
            var success = await _referentielService.UpdateRoleAsync(id, nouveauRole);
            return success ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}

