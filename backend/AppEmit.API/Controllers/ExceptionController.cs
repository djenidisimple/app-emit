using AppEmit.API.DTOs;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AppEmit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Professeur")]
    public class ExceptionController : ControllerBase
    {
        private readonly IExceptionService _exceptionService;

        public ExceptionController(IExceptionService exceptionService)
        {
            _exceptionService = exceptionService;
        }

        [HttpPost("annuler")]
        public async Task<ActionResult<ReponseExceptionDto>> AnnulerCours([FromBody] CreerExceptionDto dto)
        {
            try
            {
                var result = await _exceptionService.AnnulerCoursAsync(dto);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reporter")]
        public async Task<ActionResult<ReponseExceptionDto>> ReporterCours([FromBody] CreerExceptionDto dto)
        {
            try
            {
                var result = await _exceptionService.ReporterCoursAsync(dto);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("indisponible")]
        public async Task<ActionResult<ReponseExceptionDto>> RendreIndisponible([FromBody] CreerExceptionDto dto)
        {
            try
            {
                var result = await _exceptionService.RendreIndisponibleAsync(dto);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
