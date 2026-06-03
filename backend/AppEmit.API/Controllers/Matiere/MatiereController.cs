using AppEmit.API.Interfaces;
using AppEmit.API.DTOs.Matiere;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiExplorerSettings(IgnoreApi = true)]
public class MatiereController : Controller
{
    private readonly IMatiereService _service;
    public MatiereController(IMatiereService service) => _service = service;

    public async Task<IActionResult> Index()
    {
        return View(await _service.GetAllAsync());
    }

    public IActionResult Create() => View();

    [HttpPost]
    public async Task<IActionResult> Create(MatiereCreateDto model)
    {
        if (!ModelState.IsValid) return View(model);
        await _service.CreateAsync(model);
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(int id)
    {
        var m = await _service.GetByIdAsync(id);
        if (m == null) return NotFound();
        var model = new MatiereCreateDto { Code = m.Code, Nom = m.Nom };
        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(int id, MatiereCreateDto model)
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
