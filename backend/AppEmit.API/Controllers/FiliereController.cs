using AppEmit.API.DTOs.Filiere;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/filieres")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class FiliereController : ControllerBase
    {
        private readonly IFiliereService _service;
        public FiliereController(IFiliereService service) => _service = service;

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FiliereDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<FiliereDto>> GetById(int id)
        {
            var filiere = await _service.GetByIdAsync(id);
            if (filiere == null) return NotFound();
            return Ok(filiere);
        }

        [HttpPost]
        public async Task<ActionResult<FiliereDto>> Create([FromBody] FiliereCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<FiliereDto>> Update(int id, [FromBody] FiliereCreateDto dto)
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