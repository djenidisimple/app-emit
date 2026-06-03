using Microsoft.EntityFrameworkCore;
using AppEmit.API.Data;
using AppEmit.API.Interfaces;
using AppEmit.API.DTOs.Salle;
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
        private readonly AppDbContext _context;

        public SallesController(ISalleService salleService, AppDbContext context)
        {
            _salleService = salleService;
            _context = context;
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
            var creneau = await _context.Creneaux.FindAsync(creneauId);
            if (creneau == null) return BadRequest(new { message = "Créneau non trouvé" });

            var dateOnly = date.Date;
            var salles = await _context.Salles
                .Where(s => s.EstActive)
                .ToListAsync();

            var disponibles = new List<SalleResponseDto>();

            foreach (var salle in salles)
            {
                var occupeeParSeance = await _context.SeancesCours
                    .AnyAsync(s =>
                        s.SalleId == salle.Id &&
                        s.DateDebutAnnee <= dateOnly &&
                        s.DateFinAnnee >= dateOnly &&
                        s.CreneauId == creneauId &&
                        !s.EstTerminee);

                // FIX: Use the same statut values as ReservationService
                var occupeeParReservation = await _context.Set<Entities.Reservation>()
                    .AnyAsync(r =>
                        r.SalleId == salle.Id &&
                        r.DateReservation.Date == dateOnly &&
                        r.Statut == "Confirmée");

                if (!occupeeParSeance && !occupeeParReservation)
                {
                    disponibles.Add(new SalleResponseDto
                    {
                        Id = salle.Id,
                        CodeSalle = salle.CodeSalle ?? "",
                        Libelle = salle.Libelle ?? salle.Nom,
                        Nom = salle.Nom,
                        Capacite = salle.Capacite,
                        Equipements = salle.Equipements,
                        EstActive = salle.EstActive,
                        EstDisponible = true,
                        Type = salle.Type
                    });
                }
            }

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
