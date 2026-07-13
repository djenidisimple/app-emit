using AppEmit.API.Data;
using AppEmit.API.DTOs.Hierarchy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Controllers;

[Route("api/hierarchy")]
[ApiController]
[Authorize(Roles = "Admin")]
public class HierarchyController : ControllerBase
{
    private readonly AppDbContext _db;
    public HierarchyController(AppDbContext db) => _db = db;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<FiliereHierarchyDto>>> GetHierarchy()
    {
        var data = await _db.Filieres
            .Include(f => f.Parcours)
                .ThenInclude(p => p.Niveaux)
                    .ThenInclude(n => n.Matieres)
            .OrderBy(f => f.Nom)
            .ToListAsync();

        var result = data.Select(f => new FiliereHierarchyDto
        {
            Id = f.Id,
            Nom = f.Nom,
            Description = f.Description,
            Parcours = f.Parcours.OrderBy(p => p.Nom).Select(p => new ParcoursHierarchyDto
            {
                Id = p.Id,
                Nom = p.Nom,
                Description = p.Description,
                Niveaux = p.Niveaux.OrderBy(n => n.Code).Select(n => new NiveauHierarchyDto
                {
                    Id = n.Id,
                    Code = n.Code,
                    Matieres = n.Matieres.OrderBy(m => m.Code).Select(m => new MatiereHierarchyDto
                    {
                        Id = m.Id,
                        Code = m.Code,
                        Nom = m.Nom,
                        Description = m.Description,
                        Type = m.Type,
                    }).ToList(),
                }).ToList(),
            }).ToList(),
        }).ToList();

        return Ok(result);
    }
}
