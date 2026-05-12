using AppEmit.API.Interfaces;
using AppEmit.API.DTOs.Salle;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SallesController : ControllerBase
    {
        private readonly ISalleService _salleService;

        public SallesController(ISalleService salleService)
        {
            _salleService = salleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalleResponseDto>>> GetAll()
        {
            var salles = await _salleService.GetAllAsync();
            return Ok(salles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SalleResponseDto>> GetById(int id)
        {
            var salle = await _salleService.GetByIdAsync(id);
            if (salle == null) return NotFound();
            return Ok(salle);
        }

        [HttpPost]
        public async Task<ActionResult<SalleResponseDto>> Create(SalleCreateDto dto)
        {
            var created = await _salleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SalleResponseDto>> Update(int id, SalleUpdateDto dto)
        {
            var updated = await _salleService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _salleService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
