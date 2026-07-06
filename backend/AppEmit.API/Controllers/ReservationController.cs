using AppEmit.API.DTOs.Reservation;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AppEmit.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationReadDto>>> GetAll()
        {
            var reservations = await _reservationService.GetAllAsync();
            return Ok(reservations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReservationReadDto>> GetById(int id)
        {
            var reservation = await _reservationService.GetByIdAsync(id);
            if (reservation == null) return NotFound();
            return Ok(reservation);
        }

        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<ActionResult<IEnumerable<ReservationReadDto>>> GetByUser(int utilisateurId)
        {
            var reservations = await _reservationService.GetByUserAsync(utilisateurId);
            return Ok(reservations);
        }

        [HttpGet("statut/{statut}")]
        public async Task<ActionResult<IEnumerable<ReservationReadDto>>> GetByStatut(string statut)
        {
            var reservations = await _reservationService.GetByStatutAsync(statut);
            return Ok(reservations);
        }

        [HttpPost]
        public async Task<ActionResult<ReservationReadDto>> Create([FromBody] ReservationCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value
                           ?? User.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var created = await _reservationService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/valider")]
        public async Task<ActionResult<ReservationReadDto>> ValiderDemande(int id)
        {
            var validated = await _reservationService.ValiderDemandeAsync(id);
            if (validated == null) return NotFound();
            return Ok(validated);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/refuser")]
        public async Task<ActionResult<ReservationReadDto>> RefuserDemande(int id)
        {
            var refused = await _reservationService.RefuserDemandeAsync(id);
            if (refused == null) return NotFound();
            return Ok(refused);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("en-attente")]
        public async Task<ActionResult<IEnumerable<ReservationReadDto>>> ObtenirDemandesEnAttente()
        {
            var pending = await _reservationService.ObtenirDemandesEnAttenteAsync();
            return Ok(pending);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/statut")]
        public async Task<ActionResult<ReservationReadDto>> UpdateStatut(int id, [FromBody] ReservationUpdateStatusDto dto)
        {
            var updated = await _reservationService.UpdateStatutAsync(id, dto.Statut);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
    }
}
