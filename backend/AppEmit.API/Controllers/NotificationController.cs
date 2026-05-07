using AppEmit.API.DTOs.Notification;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationController(INotificationService service)
    {
        _service = service;
    }

    [HttpGet("utilisateur/{utilisateurId:int}")]
    public async Task<IActionResult> GetByUtilisateur(int utilisateurId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
            return BadRequest("Paramètres de pagination invalides.");

        var notifications = await _service.GetNotificationsUtilisateurAsync(utilisateurId, page, pageSize);
        return Ok(notifications);
    }

    [HttpGet("utilisateur/{utilisateurId:int}/count-non-lues")]
    public async Task<IActionResult> GetCountNonLues(int utilisateurId)
    {
        var count = await _service.GetCountNonLuesAsync(utilisateurId);
        return Ok(new { count });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var notification = await _service.GetByIdAsync(id);
        if (notification is null)
            return NotFound(new { message = $"Notification {id} introuvable." });
        return Ok(notification);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NotificationCreateDto dto)
    {
        var created = await _service.CreateNotificationAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}/lu")]
    public async Task<IActionResult> MarquerLu(int id)
    {
        var success = await _service.MarquerCommeLuAsync(id);
        if (!success) return NotFound(new { message = $"Notification {id} introuvable." });
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteNotificationAsync(id);
        if (!success) return NotFound(new { message = $"Notification {id} introuvable." });
        return NoContent();
    }
}