using AppEmit.Entities;
using AppEmit.Interfaces;
using Microsoft.AspNetCore.Mvc;
using AppEmit.Mappers;
using AppEmit.DTOs;

namespace AppEmit.Controllers
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

        // GET: api/Salles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalleDto>>> GetSalles()
        {
            var salles = await _salleService.ObtenirToutesLesSallesAsync();
            var sallesDto = salles.Select(s => s.ToSalleDto());
            return Ok(sallesDto);
        }

        // GET: api/Salles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalleDto>> GetSalle(int id)
        {
            var salle = await _salleService.ObtenirSalleParIdAsync(id);
            if (salle == null) return NotFound($"La salle avec l'ID {id} n'existe pas.");

            return Ok(salle.ToSalleDto());
        }

        // POST: api/Salles
        [HttpPost]
        public async Task<ActionResult<SalleDto>> PostSalle(SalleCreateDto salleDto)
        {
            var nouvelleSalle = await _salleService.CreerSalleAsync(salleDto.ToSalleFromCreate());
            return CreatedAtAction(nameof(GetSalle), new { id = nouvelleSalle.Id }, nouvelleSalle.ToSalleDto());
        }

        // PUT: api/Salles/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSalle(int id, SalleCreateDto salleDto)
        {
            var success = await _salleService.ModifierSalleAsync(id, salleDto.ToSalleFromCreate());
            if (!success) return NotFound();

            return NoContent();
        }

        // DELETE: api/Salles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSalle(int id)
        {
            var success = await _salleService.SupprimerSalleAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }

        // GET: api/Salles/disponibles
        [HttpGet("disponibles")]
        public async Task<ActionResult<IEnumerable<SalleDto>>> GetSallesDisponibles()
        {
            var salles = await _salleService.ObtenirSallesDisponiblesAsync();
            var sallesDto = salles.Select(s => s.ToSalleDto());
            return Ok(sallesDto);
        }
    }
}