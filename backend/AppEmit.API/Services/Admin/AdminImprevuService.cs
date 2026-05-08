// Services/Admin/AdminImprevuService.cs
using AppEmit.API.DTOs.Admin;
using AppEmit.API.Interfaces;
using AppEmit.API.Interfaces.Admin;
using AppEmit.Data;
using AppEmit.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Services.Admin;

/// <summary>
/// Gestion des imprévus avec :
/// 1. Création de l'ExceptionPlanning
/// 2. Notification de tous les acteurs concernés
/// 3. Audit dans ImprevuAdmin
/// </summary>
public class AdminImprevuService : IAdminImprevuService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notifService;
    private readonly IUtilisateurRepository _utilisateurRepo;
    private readonly ILogger<AdminImprevuService> _logger;

    public AdminImprevuService(
        AppDbContext context,
        INotificationService notifService,
        IUtilisateurRepository utilisateurRepo,
        ILogger<AdminImprevuService> logger)
    {
        _context = context;
        _notifService = notifService;
        _utilisateurRepo = utilisateurRepo;
        _logger = logger;
    }

    /// <summary>
    /// Annulation rapide : un seul appel crée l'exception, l'audit et
    /// notifie le prof + les étudiants du niveau concerné.
    /// </summary>
    public async Task<ImprevuResponseDto> AnnulationRapideAsync(AnnulationRapideDto dto)
    {
        // 1. Charger la séance avec toutes ses relations
        var seance = await _context.SeancesCours
            .Include(s => s.Matiere)
            .Include(s => s.Professeur)
            .Include(s => s.Salle)
            .Include(s => s.Creneau)
            .FirstOrDefaultAsync(s => s.Id == dto.SeanceCoursId)
            ?? throw new InvalidOperationException($"Séance {dto.SeanceCoursId} introuvable.");

        // 2. Créer l'ExceptionPlanning
        var dateDebut = dto.DateOccurrence.Date;
        var dateFin = dto.AnnulationDefinitive
            ? seance.DateFinAnnee          // annule toutes les occurrences restantes
            : dateDebut.AddDays(1);        // annule uniquement cette occurrence

        var exception = new ExceptionPlanning
        {
            SeanceCoursId = dto.SeanceCoursId,
            DateDebut = dateDebut,
            DateFin = dateFin,
            TypeException = "Annulation",
            Motif = dto.Motif ?? "Cours annulé par l'administration"
        };

        _context.ExceptionsPlanning.Add(exception);

        // 3. Créer l'audit ImprevuAdmin
        var imprevu = new ImprevuAdmin
        {
            TypeAction = "Annulation",
            SeanceCoursId = dto.SeanceCoursId,
            AdminId = dto.AdminId,
            DateAction = DateTime.UtcNow,
            Motif = dto.Motif,
            DateDebut = dateDebut,
            DateFin = dateFin
        };

        _context.Set<ImprevuAdmin>().Add(imprevu);
        await _context.SaveChangesAsync();

        // Lier l'audit à l'exception
        imprevu.ExceptionPlanningId = exception.Id;
        await _context.SaveChangesAsync();

        // 4. Construire le message de notification
        var motif = string.IsNullOrEmpty(dto.Motif) ? "sans motif précisé" : dto.Motif;
        var message = dto.AnnulationDefinitive
            ? $"⚠️ Cours de {seance.Matiere.Nom} annulé définitivement à partir du {dateDebut:dd/MM/yyyy}. Motif : {motif}"
            : $"⚠️ Cours de {seance.Matiere.Nom} annulé le {dateDebut:dd/MM/yyyy} ({seance.Creneau.HeureDebut:hh\\:mm}-{seance.Creneau.HeureFin:hh\\:mm}). Motif : {motif}";

        // 5. Notifier le professeur
        await _notifService.EnvoyerNotificationAsync(seance.ProfesseurId, message);

        // 6. Notifier les étudiants du niveau associé à cette séance
        var nbNotifs = 1;
        var etudiants = await GetEtudiantsParSeanceAsync(seance.Id);
        if (etudiants.Any())
        {
            await _notifService.EnvoyerNotificationsBulkAsync(etudiants, message);
            nbNotifs += etudiants.Count();
        }

        _logger.LogInformation(
            "Annulation rapide SeanceId={Id} par Admin={Admin}. {N} notifications envoyées.",
            dto.SeanceCoursId, dto.AdminId, nbNotifs);

        return BuildResponse(imprevu, seance, nbNotifs);
    }

    /// <summary>Report de cours vers une autre salle ou date.</summary>
    public async Task<ImprevuResponseDto> ReporterCoursAsync(ReportCoursDto dto)
    {
        var seance = await _context.SeancesCours
            .Include(s => s.Matiere)
            .Include(s => s.Professeur)
            .Include(s => s.Salle)
            .Include(s => s.Creneau)
            .FirstOrDefaultAsync(s => s.Id == dto.SeanceCoursId)
            ?? throw new InvalidOperationException("Séance introuvable.");

        // Vérifier la nouvelle salle si changement
        Salle? nouvelleSalle = null;
        if (dto.NouvelleSalleId.HasValue)
        {
            nouvelleSalle = await _context.Salles.FindAsync(dto.NouvelleSalleId.Value)
                ?? throw new InvalidOperationException("Nouvelle salle introuvable.");
        }

        // Créer l'exception de type Report
        var exception = new ExceptionPlanning
        {
            SeanceCoursId = dto.SeanceCoursId,
            DateDebut = dto.DateOccurrence.Date,
            DateFin = dto.DateOccurrence.Date.AddDays(1),
            TypeException = "Report",
            Motif = dto.Motif,
            NouvelleSalleId = dto.NouvelleSalleId
        };

        _context.ExceptionsPlanning.Add(exception);

        var imprevu = new ImprevuAdmin
        {
            TypeAction = "Report",
            SeanceCoursId = dto.SeanceCoursId,
            AdminId = dto.AdminId,
            DateAction = DateTime.UtcNow,
            Motif = dto.Motif,
            DateDebut = dto.DateOccurrence.Date,
            DateFin = dto.DateOccurrence.Date.AddDays(1),
            NouvelleSalleId = dto.NouvelleSalleId
        };

        _context.Set<ImprevuAdmin>().Add(imprevu);
        await _context.SaveChangesAsync();

        // Construire le message adapté
        var details = nouvelleSalle != null
            ? $"déplacé en salle {nouvelleSalle.Libelle}"
            : "reporté";
        var message = $"📅 Cours de {seance.Matiere.Nom} du {dto.DateOccurrence:dd/MM/yyyy} {details}. Motif : {dto.Motif ?? "non précisé"}";

        await _notifService.EnvoyerNotificationAsync(seance.ProfesseurId, message);
        var etudiants = await GetEtudiantsParSeanceAsync(seance.Id);
        if (etudiants.Any())
            await _notifService.EnvoyerNotificationsBulkAsync(etudiants, message);

        return BuildResponse(imprevu, seance, etudiants.Count() + 1);
    }

    /// <summary>Historique des actions admin paginé.</summary>
    public async Task<IEnumerable<ImprevuResponseDto>> GetHistoriqueAsync(int page = 1, int pageSize = 20)
    {
        var imprevus = await _context.Set<ImprevuAdmin>()
            .AsNoTracking()
            .Include(i => i.SeanceCours).ThenInclude(s => s.Matiere)
            .Include(i => i.SeanceCours).ThenInclude(s => s.Professeur)
            .Include(i => i.SeanceCours).ThenInclude(s => s.Salle)
            .Include(i => i.Admin)
            .OrderByDescending(i => i.DateAction)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return imprevus.Select(i => BuildResponse(i, i.SeanceCours, 0));
    }

    /// <summary>Suppression d'un imprévu (et de l'exception associée).</summary>
    public async Task<bool> AnnulerImprevuAsync(int imprevuId)
    {
        var imprevu = await _context.Set<ImprevuAdmin>()
            .FirstOrDefaultAsync(i => i.Id == imprevuId);

        if (imprevu is null) return false;

        // Supprimer l'exception liée
        if (imprevu.ExceptionPlanningId.HasValue)
        {
            await _context.ExceptionsPlanning
                .Where(e => e.Id == imprevu.ExceptionPlanningId.Value)
                .ExecuteDeleteAsync();
        }

        _context.Set<ImprevuAdmin>().Remove(imprevu);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Helpers privés ────────────────────────────────────────────────────────

    private async Task<IEnumerable<int>> GetEtudiantsParSeanceAsync(int seanceId)
    {
        // Récupère les étudiants via la relation Niveau → Utilisateurs
        var seance = await _context.SeancesCours
            .Include(s => s.Creneau)
            .FirstOrDefaultAsync(s => s.Id == seanceId);

        if (seance == null) return Enumerable.Empty<int>();

        // Cherche les étudiants liés au niveau qui a cette séance
        return await _context.Niveaux
            .Where(n => n.Seances.Any(s => s.Id == seanceId))
            .SelectMany(n => n.Utilisateurs)
            .Where(u => u.Role == "Etudiant")
            .Select(u => u.Id)
            .ToListAsync();
    }

    private static ImprevuResponseDto BuildResponse(
        ImprevuAdmin imprevu, SeanceCours seance, int nbNotifs)
    {
        return new ImprevuResponseDto
        {
            Id = imprevu.Id,
            TypeAction = imprevu.TypeAction,
            SeanceCoursId = imprevu.SeanceCoursId,
            MatiereNom = seance?.Matiere?.Nom ?? "",
            ProfesseurNom = $"{seance?.Professeur?.Nom} {seance?.Professeur?.Prenom}",
            SalleCode = seance?.Salle?.CodeSalle ?? "",
            DateAction = imprevu.DateAction,
            Motif = imprevu.Motif,
            DateDebut = imprevu.DateDebut,
            DateFin = imprevu.DateFin,
            NombreNotificationsEnvoyees = nbNotifs
        };
    }
}