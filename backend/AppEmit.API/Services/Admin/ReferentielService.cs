// Services/Admin/ReferentielService.cs
using AppEmit.API.DTOs.Admin.Referentiel;
using AppEmit.API.Interfaces.Admin;
using AppEmit.Data;
using AppEmit.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Services.Admin;

/// <summary>
/// Gestion CRUD de toutes les tables de référence universitaire.
/// Filières → Parcours → Niveaux + Utilisateurs + Matières.
/// </summary>
public class ReferentielService : IReferentielService
{
    private readonly AppDbContext _context;

    public ReferentielService(AppDbContext context) => _context = context;

    // ════════════════════════════════════════════════════
    // FILIÈRES
    // ════════════════════════════════════════════════════

    public async Task<IEnumerable<FiliereReadDto>> GetFilieresAsync()
    {
        return await _context.Filieres
            .AsNoTracking()
            .Select(f => new FiliereReadDto
            {
                Id = f.Id,
                Nom = f.Nom,
                NombreParcours = f.Parcours.Count
            })
            .OrderBy(f => f.Nom)
            .ToListAsync();
    }

    public async Task<FiliereReadDto> CreateFiliereAsync(FiliereCreateDto dto)
    {
        // Vérification unicité
        if (await _context.Filieres.AnyAsync(f => f.Nom == dto.Nom))
            throw new InvalidOperationException($"La filière '{dto.Nom}' existe déjà.");

        var entity = new Filiere { Nom = dto.Nom };
        _context.Filieres.Add(entity);
        await _context.SaveChangesAsync();

        return new FiliereReadDto { Id = entity.Id, Nom = entity.Nom, NombreParcours = 0 };
    }

    public async Task<FiliereReadDto?> UpdateFiliereAsync(int id, FiliereCreateDto dto)
    {
        var filiere = await _context.Filieres
            .Include(f => f.Parcours)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (filiere is null) return null;

        filiere.Nom = dto.Nom;
        await _context.SaveChangesAsync();

        return new FiliereReadDto { Id = filiere.Id, Nom = filiere.Nom, NombreParcours = filiere.Parcours.Count };
    }

    public async Task<bool> DeleteFiliereAsync(int id)
    {
        // Empêcher la suppression si des parcours existent
        var hasParcours = await _context.Parcours.AnyAsync(p => p.FiliereId == id);
        if (hasParcours)
            throw new InvalidOperationException("Impossible de supprimer une filière qui contient des parcours.");

        var rows = await _context.Filieres.Where(f => f.Id == id).ExecuteDeleteAsync();
        return rows > 0;
    }

    // ════════════════════════════════════════════════════
    // NIVEAUX
    // ════════════════════════════════════════════════════

    public async Task<IEnumerable<NiveauReadDto>> GetNiveauxAsync(int? parcoursId = null)
    {
        var query = _context.Niveaux
            .AsNoTracking()
            .Include(n => n.Parcours).ThenInclude(p => p.Filiere)
            .AsQueryable();

        if (parcoursId.HasValue)
            query = query.Where(n => n.ParcoursId == parcoursId.Value);

        return await query.Select(n => new NiveauReadDto
        {
            Id = n.Id,
            Code = n.Code,
            ParcoursId = n.ParcoursId,
            ParcoursNom = n.Parcours.Nom,
            FiliereNom = n.Parcours.Filiere.Nom
        }).OrderBy(n => n.FiliereNom).ThenBy(n => n.ParcoursNom).ThenBy(n => n.Code)
          .ToListAsync();
    }

    public async Task<NiveauReadDto> CreateNiveauAsync(NiveauCreateDto dto)
    {
        if (!await _context.Parcours.AnyAsync(p => p.Id == dto.ParcoursId))
            throw new InvalidOperationException("Parcours introuvable.");

        if (await _context.Niveaux.AnyAsync(n => n.Code == dto.Code && n.ParcoursId == dto.ParcoursId))
            throw new InvalidOperationException($"Le niveau '{dto.Code}' existe déjà dans ce parcours.");

        var entity = new Niveau { Code = dto.Code, ParcoursId = dto.ParcoursId };
        _context.Niveaux.Add(entity);
        await _context.SaveChangesAsync();

        // Recharger avec navigation pour le DTO de retour
        var result = await _context.Niveaux
            .Include(n => n.Parcours).ThenInclude(p => p.Filiere)
            .FirstAsync(n => n.Id == entity.Id);

        return new NiveauReadDto
        {
            Id = result.Id, Code = result.Code,
            ParcoursId = result.ParcoursId, ParcoursNom = result.Parcours.Nom,
            FiliereNom = result.Parcours.Filiere.Nom
        };
    }

    public async Task<NiveauReadDto?> UpdateNiveauAsync(int id, NiveauCreateDto dto)
    {
        var niveau = await _context.Niveaux
            .Include(n => n.Parcours).ThenInclude(p => p.Filiere)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (niveau is null) return null;

        niveau.Code = dto.Code;
        niveau.ParcoursId = dto.ParcoursId;
        await _context.SaveChangesAsync();

        return new NiveauReadDto
        {
            Id = niveau.Id, Code = niveau.Code,
            ParcoursId = niveau.ParcoursId, ParcoursNom = niveau.Parcours.Nom,
            FiliereNom = niveau.Parcours.Filiere.Nom
        };
    }

    public async Task<bool> DeleteNiveauAsync(int id)
    {
        var hasSeances = await _context.SeancesCours.AnyAsync(s =>
            _context.Niveaux.Any(n => n.Id == id && n.Seances.Contains(s)));

        if (hasSeances)
            throw new InvalidOperationException("Ce niveau a des séances de cours associées.");

        var rows = await _context.Niveaux.Where(n => n.Id == id).ExecuteDeleteAsync();
        return rows > 0;
    }

    // ════════════════════════════════════════════════════
    // UTILISATEURS
    // ════════════════════════════════════════════════════

    public async Task<IEnumerable<UtilisateurReadDto>> GetUtilisateursAsync(string? role = null)
    {
        var query = _context.Utilisateurs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Role == role);

        return await query.Select(u => new UtilisateurReadDto
        {
            Id = u.Id, Matricule = u.Matricule, Nom = u.Nom,
            Prenom = u.Prenom, Email = u.Email, Role = u.Role
        }).OrderBy(u => u.Nom).ToListAsync();
    }

    public async Task<UtilisateurReadDto> CreateUtilisateurAsync(UtilisateurCreateDto dto)
    {
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Un compte avec cet email existe déjà.");

        if (await _context.Utilisateurs.AnyAsync(u => u.Matricule == dto.Matricule))
            throw new InvalidOperationException("Ce matricule est déjà utilisé.");

        var entity = new Utilisateur
        {
            Matricule = dto.Matricule, Nom = dto.Nom, Prenom = dto.Prenom,
            Email = dto.Email, Role = dto.Role,
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse)
        };

        _context.Utilisateurs.Add(entity);
        await _context.SaveChangesAsync();

        return new UtilisateurReadDto
        {
            Id = entity.Id, Matricule = entity.Matricule, Nom = entity.Nom,
            Prenom = entity.Prenom, Email = entity.Email, Role = entity.Role
        };
    }

    public async Task<bool> DeleteUtilisateurAsync(int id)
    {
        // Vérification : ne pas supprimer un prof qui a des séances actives
        var hasCours = await _context.SeancesCours
            .AnyAsync(s => s.ProfesseurId == id && !s.EstTerminee);

        if (hasCours)
            throw new InvalidOperationException("Ce professeur a des cours actifs. Terminez-les avant de supprimer.");

        var rows = await _context.Utilisateurs.Where(u => u.Id == id).ExecuteDeleteAsync();
        return rows > 0;
    }

    public async Task<bool> UpdateRoleAsync(int id, string nouveauRole)
    {
        var roles = new[] { "Admin", "Professeur", "Etudiant" };
        if (!roles.Contains(nouveauRole))
            throw new InvalidOperationException($"Rôle invalide. Valeurs acceptées : {string.Join(", ", roles)}");

        var rows = await _context.Utilisateurs
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.Role, nouveauRole));

        return rows > 0;
    }
}

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