using AppEmit.API.DTOs.Parcours;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/parcours")]
    [ApiController]
    public class ParcoursApiController : ControllerBase
    {
        private readonly IParcoursService _service;
        public ParcoursApiController(IParcoursService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParcoursDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ParcoursDto>> GetById(int id)
        {
            var parcours = await _service.GetByIdAsync(id);
            if (parcours == null) return NotFound();
            return Ok(parcours);
        }

        [HttpPost]
        public async Task<ActionResult<ParcoursDto>> Create([FromBody] ParcoursCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ParcoursDto>> Update(int id, [FromBody] ParcoursCreateDto dto)
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
