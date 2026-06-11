using AppEmit.API.DTOs.Notification;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationReadDto>>> GetAll()
        {
            var notifications = await _notificationService.GetAllAsync();
            return Ok(notifications);
        }

        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<ActionResult<IEnumerable<NotificationReadDto>>> GetByUtilisateur(int utilisateurId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var notifications = await _notificationService.GetByUtilisateurIdAsync(utilisateurId, page, pageSize);
            return Ok(notifications);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationReadDto>> GetById(int id)
        {
            var notification = await _notificationService.GetByIdAsync(id);
            if (notification == null) return NotFound();
            return Ok(notification);
        }

        [HttpPost]
        public async Task<ActionResult<NotificationReadDto>> Create([FromBody] NotificationCreateDto dto)
        {
            var created = await _notificationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NotificationCreateDto dto)
        {
            var success = await _notificationService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _notificationService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/lu")]
        public async Task<IActionResult> MarquerCommeLu(int id)
        {
            var success = await _notificationService.MarquerCommeLuAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("tout-lire")]
        public async Task<IActionResult> MarquerToutLu([FromQuery] int utilisateurId)
        {
            var success = await _notificationService.MarquerToutCommeLuAsync(utilisateurId);
            return Ok(new { success });
        }
    }
}
