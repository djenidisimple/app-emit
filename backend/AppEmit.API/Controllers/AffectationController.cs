using AppEmit.API.DTOs.Affectation;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers;

[Route("api/affectations")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AffectationController : ControllerBase
{
    private readonly IAffectationService _service;

    public AffectationController(IAffectationService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AffectationDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<AffectationDto>> GetById(int id)
    {
        var aff = await _service.GetByIdAsync(id);
        if (aff == null) return NotFound();
        return Ok(aff);
    }

    [AllowAnonymous]
    [HttpGet("professeur/{professeurId}")]
    public async Task<ActionResult<IEnumerable<AffectationDto>>> GetByProfesseur(int professeurId)
    {
        return Ok(await _service.GetByProfesseurIdAsync(professeurId));
    }

    [HttpPost]
    public async Task<ActionResult<AffectationDto>> Create([FromBody] AffectationCreateDto dto)
    {
        try
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
