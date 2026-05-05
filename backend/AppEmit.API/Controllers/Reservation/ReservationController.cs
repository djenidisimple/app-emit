using AppEmit.Interfaces;
using AppEmit.DTOs.Reservation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AppEmit.Controllers;

[Authorize(Roles = "Etudiant")]
public class ReservationClubController : Controller
{
    private readonly IReservationService _reservationService;
    private readonly ISalleService _salleService;

    public ReservationClubController(IReservationService reservationService, ISalleService salleService)
    {
        _reservationService = reservationService;
        _salleService = salleService;
    }

    public async Task<IActionResult> Index()
    {
        var userId = GetCurrentUserId();
        var reservations = await _reservationService.GetReservationsByUserAsync(userId);
        return View(reservations);
    }

    public async Task<IActionResult> Create()
    {
        ViewBag.Salles = await _salleService.GetAllAsync();
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(ReservationCreateDto model)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.Salles = await _salleService.GetAllAsync();
            return View(model);
        }

        try
        {
            var userId = GetCurrentUserId();
            await _reservationService.CreateReservationAsync(userId, model);
            TempData["Success"] = "Demande de réservation envoyée avec succès.";
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            ModelState.AddModelError("", ex.Message);
            ViewBag.Salles = await _salleService.GetAllAsync();
            return View(model);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Annuler(int id)
    {
        var userId = GetCurrentUserId();
        var result = await _reservationService.CancelReservationAsync(id, userId);
        
        if (result)
            TempData["Success"] = "Réservation annulée.";
        else
            TempData["Error"] = "Impossible d'annuler cette réservation.";

        return RedirectToAction(nameof(Index));
    }

    private int GetCurrentUserId()
    {
        // À adapter selon ton système d'authentification
        return int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
    }
}