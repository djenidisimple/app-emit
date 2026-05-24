using AppEmit.API.DTOs.Niveau;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NiveauController : ControllerBase
    {
        private readonly INiveauService _service;
        public NiveauController(INiveauService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NiveauDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NiveauDto>> GetById(int id)
        {
            var niveau = await _service.GetByIdAsync(id);
            if (niveau == null) return NotFound();
            return Ok(niveau);
        }

        [HttpPost]
        public async Task<ActionResult<NiveauDto>> Create(NiveauCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NiveauDto>> Update(int id, NiveauCreateDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}