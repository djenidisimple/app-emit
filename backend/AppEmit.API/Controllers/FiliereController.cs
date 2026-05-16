using AppEmit.API.DTOs.Filiere;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FiliereController : ControllerBase
    {
        private readonly IFiliereService _service;
        public FiliereController(IFiliereService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FiliereDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FiliereDto>> GetById(int id)
        {
            var filiere = await _service.GetByIdAsync(id);
            if (filiere == null) return NotFound();
            return Ok(filiere);
        }

        [HttpPost]
        public async Task<ActionResult<FiliereDto>> Create(FiliereCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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
