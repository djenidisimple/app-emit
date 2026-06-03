using AppEmit.API.DTOs;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AppEmit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlanningController : ControllerBase
    {
        private readonly IPlanningHebdoService _planningService;

        public PlanningController(IPlanningHebdoService planningService)
        {
            _planningService = planningService;
        }

        /// <summary>
        /// Récupère le planning hebdomadaire en fonction des filtres.
        /// </summary>
        /// <param name="request">Contient StartDate (obligatoire) et éventuellement ProfesseurId/SalleId.</param>
        [HttpGet("hebdo")]
        public async Task<ActionResult<PlanningHebdoResponseDto>> GetPlanningHebdo([FromQuery] PlanningHebdoRequestDto request)
        {
            if (request.StartDate == default)
                return BadRequest("La date de début (StartDate) est obligatoire.");

            var result = await _planningService.GetPlanningHebdomadaireAsync(request);
            return Ok(result);
        }
    }
}
