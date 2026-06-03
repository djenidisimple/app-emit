using AppEmit.API.DTOs.Matiere;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/matieres")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class MatieresController : ControllerBase
    {
        private readonly IMatiereService _service;
        public MatieresController(IMatiereService service) => _service = service;

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MatiereDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<MatiereDto>> GetById(int id)
        {
            var matiere = await _service.GetByIdAsync(id);
            if (matiere == null) return NotFound();
            return Ok(matiere);
        }

        [HttpPost]
        public async Task<ActionResult<MatiereDto>> Create([FromBody] MatiereCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MatiereDto>> Update(int id, [FromBody] MatiereCreateDto dto)
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
