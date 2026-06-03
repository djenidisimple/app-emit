using AppEmit.API.Interfaces;
using AppEmit.API.DTOs.Parcours;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiExplorerSettings(IgnoreApi = true)]
public class ParcoursController : Controller
{
    private readonly IParcoursService _service;
    public ParcoursController(IParcoursService service) => _service = service;

    public async Task<IActionResult> Index()
    {
        return View(await _service.GetAllAsync());
    }

    public IActionResult Create() => View();

    [HttpPost]
    public async Task<IActionResult> Create(ParcoursCreateDto model)
    {
        if (!ModelState.IsValid) return View(model);
        await _service.CreateAsync(model);
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(int id)
    {
        var p = await _service.GetByIdAsync(id);
        if (p == null) return NotFound();
        var model = new ParcoursCreateDto { Nom = p.Nom, FiliereId = p.FiliereId };
        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(int id, ParcoursCreateDto model)
    {
        if (!ModelState.IsValid) return View(model);
        await _service.UpdateAsync(id, model);
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return RedirectToAction(nameof(Index));
    }
}
