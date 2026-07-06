using AppEmit.API.DTOs.Salle;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SallesController : ControllerBase
    {
        private readonly ISalleService _salleService;

        public SallesController(ISalleService salleService)
        {
            _salleService = salleService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalleResponseDto>>> GetAll()
        {
            var salles = await _salleService.GetAllAsync();
            return Ok(salles);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<SalleResponseDto>> GetById(int id)
        {
            var salle = await _salleService.GetByIdAsync(id);
            if (salle == null) return NotFound();
            return Ok(salle);
        }

        [AllowAnonymous]
        [HttpGet("disponibles")]
        public async Task<ActionResult<IEnumerable<SalleResponseDto>>> GetDisponibles(
            [FromQuery] DateTime date,
            [FromQuery] int creneauId)
        {
            var disponibles = await _salleService.GetDisponiblesAsync(date, creneauId);
            return Ok(disponibles);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<SalleResponseDto>> Create([FromBody] SalleCreateDto dto)
        {
            var created = await _salleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<SalleResponseDto>> Update(int id, [FromBody] SalleUpdateDto dto)
        {
            var updated = await _salleService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _salleService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
