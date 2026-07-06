using AppEmit.API.DTOs.Examen;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/examens")]
    [ApiController]
    [Authorize]
    public class ExamenController : ControllerBase
    {
        private readonly IExamenService _examenService;

        public ExamenController(IExamenService examenService)
        {
            _examenService = examenService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ExamenReadDto>>> GetAll()
        {
            var examens = await _examenService.GetAllAsync();
            return Ok(examens);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExamenReadDto>> GetById(int id)
        {
            var examen = await _examenService.GetByIdAsync(id);
            if (examen == null)
                return NotFound();
            return Ok(examen);
        }

        [HttpGet("niveau/{niveauId}")]
        public async Task<ActionResult<List<ExamenReadDto>>> GetByNiveau(int niveauId)
        {
            var examens = await _examenService.GetByNiveauAsync(niveauId);
            return Ok(examens);
        }

        [HttpGet("parcours/{parcoursId}")]
        public async Task<ActionResult<List<ExamenReadDto>>> GetByParcours(int parcoursId)
        {
            var examens = await _examenService.GetByParcoursAsync(parcoursId);
            return Ok(examens);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ExamenReadDto>> Create([FromBody] ExamenCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _examenService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ExamenReadDto>> Update(int id, [FromBody] ExamenUpdateDto dto)
        {
            var updated = await _examenService.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _examenService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
