using AppEmit.API.DTOs.DemandeEchange;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DemandeEchangeController : ControllerBase
    {
        private readonly IDemandeEchangeService _service;

        public DemandeEchangeController(IDemandeEchangeService service)
        {
            _service = service;
        }

        // POST /api/DemandeEchange
        [HttpPost]
        public async Task<ActionResult<DemandeEchangeReadDto>> Creer(
            [FromBody] DemandeEchangeCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreerDemande(dto);
            return CreatedAtAction(nameof(GetById),
                new { id = result.Id }, result);
        }

        // GET /api/DemandeEchange?professeurId=1
        [HttpGet]
        public async Task<ActionResult<List<DemandeEchangeReadDto>>> GetAll(
            [FromQuery] int professeurId)
        {
            var result = await _service.ObtenirDemandes(professeurId);
            return Ok(result);
        }

        // GET /api/DemandeEchange/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DemandeEchangeReadDto>> GetById(int id)
        {
            var demande = await _service.ObtenirDemandeParId(id);
            if (demande == null) return NotFound();
            return Ok(demande);
        }

        // PATCH /api/DemandeEchange/{id}/statut
        [HttpPatch("{id}/statut")]
        public async Task<ActionResult<DemandeEchangeReadDto>> UpdateStatut(
            int id, [FromBody] DemandeEchangeUpdateStatusDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = dto.Statut == "Acceptee"
                ? await _service.AccepterDemande(id)
                : await _service.RefuserDemande(id);

            return Ok(result);
        }
    }
}