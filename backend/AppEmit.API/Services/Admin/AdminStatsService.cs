// Services/Admin/AdminStatsService.cs
using AppEmit.API.DTOs.Admin;
using AppEmit.API.Interfaces.Admin;
using AppEmit.Data;
using AppEmit.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Services.Admin;

public class AdminStatsService : IAdminStatsService
{
    private readonly AppDbContext _context;

    public AdminStatsService(AppDbContext context) => _context = context;

    public async Task<StatAdminDto> GetStatistiquesAsync()
    {
        var aujourd = DateTime.UtcNow.Date;
        var demain = aujourd.AddDays(1);

        // Toutes les requêtes en parallèle pour des performances optimales
        var tasks = await Task.WhenAll(
            _context.Salles.CountAsync(),                                             // 0 total salles
            _context.Salles.CountAsync(s => s.EstActive),                            // 1 actives
            _context.Utilisateurs.CountAsync(u => u.Role == "Professeur"),           // 2 profs
            _context.Utilisateurs.CountAsync(u => u.Role == "Etudiant"),             // 3 étudiants
            _context.Matieres.CountAsync(),                                           // 4 matières
            _context.Parcours.CountAsync(),                                           // 5 parcours
            _context.Filieres.CountAsync(),                                           // 6 filières
            _context.Niveaux.CountAsync(),                                            // 7 niveaux
            _context.ExceptionsPlanning.CountAsync(e =>                              // 8 annulations
                e.DateDebut >= aujourd && e.DateDebut < demain && e.TypeException == "Annulation"),
            _context.ExceptionsPlanning.CountAsync(e =>                              // 9 reports
                e.DateDebut >= aujourd && e.DateDebut < demain && e.TypeException == "Report"),
            _context.Notifications.CountAsync(n => n.DateEnvoi >= aujourd)           // 10 notifs aujourd'hui
        );

        return new StatAdminDto
        {
            TotalSalles = tasks[0], SallesActives = tasks[1],
            TotalProfesseurs = tasks[2], TotalEtudiants = tasks[3],
            TotalMatieres = tasks[4], TotalParcours = tasks[5],
            TotalFilieres = tasks[6], TotalNiveaux = tasks[7],
            CoursAnnulesAujourdhui = tasks[8], CoursReportesAujourdhui = tasks[9],
            NotificationsEnvoyeesAujourdhui = tasks[10]
        };
    }
}