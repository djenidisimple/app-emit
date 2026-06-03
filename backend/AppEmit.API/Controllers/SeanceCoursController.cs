using AppEmit.API.DTOs.SeanceCours;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [Route("api/seances")]
    [ApiController]
    [Authorize]
    public class SeanceCoursController : ControllerBase
    {
        private readonly ISeanceCoursService _seanceCoursService;

        public SeanceCoursController(ISeanceCoursService seanceCoursService)
        {
            _seanceCoursService = seanceCoursService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SeanceCoursReadDto>> GetById(int id)
        {
            var seance = await _seanceCoursService.GetByIdAsync(id);

            if (seance == null)
                return NotFound();

            return Ok(seance);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<SeanceCoursReadDto>> Update(
            int id,
            [FromBody] SeanceCoursUpdateDto dto)
        {
            var updated = await _seanceCoursService.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        [Authorize(Roles = "Admin,Professeur")]
        [HttpPatch("{id}/terminer")]
        public async Task<IActionResult> MarquerTerminee(int id)
        {
            var result = await _seanceCoursService.MarquerTermineeAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }

        // POST /api/SeanceCours
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<SeanceCoursReadDto>> Create(
            [FromBody] SeanceCoursCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _seanceCoursService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                created
            );
        }

        // POST /api/SeanceCours/generer — matches frontend GenerationSeancePayload
        [Authorize(Roles = "Admin")]
        [HttpPost("generer")]
        public async Task<ActionResult<List<SeanceCoursReadDto>>> Generer(
            [FromBody] GenerationSeancePayloadDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createDto = new SeanceCoursCreateDto
            {
                ProfesseurId = dto.ProfId,
                MatiereId = dto.MatiereId,
                SalleId = dto.SalleId,
                CreneauId = dto.CreneauId,
                ParcoursId = dto.ParcoursId,
                NiveauId = dto.NiveauId,
                DateDebutAnnee = dto.DateDebut,
                DateFinAnnee = dto.DateFin,
                CouleurAffichage = dto.CouleurAffichage ?? "#3B82F6",
            };

            var created = await _seanceCoursService.CreateAsync(createDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                new List<SeanceCoursReadDto> { created }
            );
        }
    }
}