// Controllers/Admin/AdminStatsController.cs
using AppEmit.API.DTOs.Admin;
using AppEmit.API.Interfaces.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers.Admin;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly IAdminStatsService _statsService;
    public AdminStatsController(IAdminStatsService statsService) => _statsService = statsService;

    /// <summary>Tableau de bord : statistiques globales du système.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(StatAdminDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
        => Ok(await _statsService.GetStatistiquesAsync());
}