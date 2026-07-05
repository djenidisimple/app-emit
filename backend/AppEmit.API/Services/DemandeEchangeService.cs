using System.Security.Claims;
using AppEmit.API.Data;
using AppEmit.API.DTOs.DemandeEchange;
using AppEmit.API.DTOs.Notification;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppEmit.API.Services
{
    public class DemandeEchangeService : IDemandeEchangeService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DemandeEchangeService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public DemandeEchangeService(AppDbContext context,
            ILogger<DemandeEchangeService> logger,
            IHttpContextAccessor httpContextAccessor,
            INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        private int GetCurrentUserId()
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : throw new UnauthorizedException("Utilisateur non authentifié.");
        }

        public async Task<DemandeEchangeReadDto> CreerDemande(
            DemandeEchangeCreateDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (dto.DemandeurId != currentUserId)
                throw new UnauthorizedException("Vous ne pouvez pas créer une demande au nom d'un autre utilisateur.");

            var demandeur = await _context.Utilisateurs.FindAsync(currentUserId)
                ?? throw new NotFoundException("Utilisateur introuvable.");

            var seanceDemandeur = await _context.SeancesCours
                .Include(s => s.Matiere)
                .FirstOrDefaultAsync(s => s.Id == dto.SeanceDemandeurId)
                ?? throw new NotFoundException("Séance du demandeur introuvable.");

            if (seanceDemandeur.ProfesseurId != currentUserId)
                throw new UnauthorizedException("Cette séance ne vous appartient pas.");

            var seanceCible = await _context.SeancesCours
                .Include(s => s.Matiere)
                .FirstOrDefaultAsync(s => s.Id == dto.SeanceCibleId)
                ?? throw new NotFoundException("Séance cible introuvable.");

            // Vérifier qu'il n'y a pas déjà une demande en attente
            var dejaExistante = await _context.DemandesEchange
                .AnyAsync(d =>
                    d.DemandeurId == dto.DemandeurId &&
                    d.SeanceDemandeurId == dto.SeanceDemandeurId &&
                    d.Statut == "EnAttente");

            if (dejaExistante)
                throw new Exception("Une demande d'échange est déjà en attente pour cette séance.");

            var demande = new DemandeEchange
            {
                DemandeurId = dto.DemandeurId,
                CibleId = dto.CibleId,
                SeanceDemandeurId = dto.SeanceDemandeurId,
                SeanceCibleId = dto.SeanceCibleId,
                Motif = dto.Motif,
                Statut = "EnAttente",
                DateDemande = DateTime.UtcNow
            };

            _context.DemandesEchange.Add(demande);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Demande d'échange créée. Id={Id}", demande.Id);

            try
            {
                await _notificationService.CreateAsync(new NotificationCreateDto
                {
                    UtilisateurId = dto.CibleId,
                    Message = $"Nouvelle demande d'échange de {demandeur.Prenom} {demandeur.Nom} pour la séance de {seanceDemandeur.Matiere?.Nom ?? $"#{dto.SeanceDemandeurId}"}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Échec de la notification pour la demande d'échange {Id}", demande.Id);
            }

            var created = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .Include(d => d.SeanceDemandeur).ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCible).ThenInclude(s => s.Matiere)
                .FirstOrDefaultAsync(d => d.Id == demande.Id);

            return MapToReadDtoSync(created!);
        }

        public async Task<List<DemandeEchangeReadDto>> ObtenirDemandes(
            int professeurId)
        {
            var demandes = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .Include(d => d.SeanceDemandeur).ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCible).ThenInclude(s => s.Matiere)
                .Where(d => d.DemandeurId == professeurId
                         || d.CibleId == professeurId)
                .OrderByDescending(d => d.DateDemande)
                .ToListAsync();

            return demandes.Select(d => MapToReadDtoSync(d)).ToList();
        }

        public async Task<DemandeEchangeReadDto?> ObtenirDemandeParId(int id)
        {
            var demande = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .Include(d => d.SeanceDemandeur).ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCible).ThenInclude(s => s.Matiere)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (demande == null) return null;

            return MapToReadDtoSync(demande);
        }

        public async Task<DemandeEchangeReadDto> AccepterDemande(int id)
        {
            var demande = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .Include(d => d.SeanceDemandeur).ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCible).ThenInclude(s => s.Matiere)
                .FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new NotFoundException("Demande introuvable.");

            if (demande.Statut != "EnAttente")
                throw new Exception("Cette demande a déjà été traitée.");

            var currentUserId = GetCurrentUserId();
            if (currentUserId != demande.CibleId)
                throw new UnauthorizedException("Seul le professeur cible peut accepter cette demande.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            var seanceDemandeur = await _context.SeancesCours
                .FindAsync(demande.SeanceDemandeurId);
            var seanceCible = await _context.SeancesCours
                .FindAsync(demande.SeanceCibleId);

            if (seanceDemandeur == null || seanceCible == null)
                throw new NotFoundException("Une des séances n'existe plus.");

            (seanceDemandeur.ProfesseurId, seanceCible.ProfesseurId) =
                (seanceCible.ProfesseurId, seanceDemandeur.ProfesseurId);

            demande.Statut = "Acceptee";
            demande.DateReponse = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            _logger.LogInformation("Demande {Id} acceptée, échange effectué.", id);

            try
            {
                await _notificationService.CreateAsync(new NotificationCreateDto
                {
                    UtilisateurId = demande.DemandeurId,
                    Message = $"Votre demande d'échange pour {demande.SeanceDemandeur?.Matiere?.Nom ?? $"séance #{demande.SeanceDemandeurId}"} a été acceptée par {demande.Cible?.Prenom} {demande.Cible?.Nom}."
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Échec de la notification d'acceptation pour la demande {Id}", id);
            }

            return MapToReadDtoSync(demande);
        }

        public async Task<DemandeEchangeReadDto> RefuserDemande(int id)
        {
            var demande = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .Include(d => d.SeanceDemandeur).ThenInclude(s => s.Matiere)
                .Include(d => d.SeanceCible).ThenInclude(s => s.Matiere)
                .FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new NotFoundException("Demande introuvable.");

            if (demande.Statut != "EnAttente")
                throw new Exception("Cette demande a déjà été traitée.");

            var currentUserId = GetCurrentUserId();
            if (currentUserId != demande.CibleId)
                throw new UnauthorizedException("Seul le professeur cible peut refuser cette demande.");

            demande.Statut = "Refusee";
            demande.DateReponse = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Demande {Id} refusée.", id);

            try
            {
                await _notificationService.CreateAsync(new NotificationCreateDto
                {
                    UtilisateurId = demande.DemandeurId,
                    Message = $"Votre demande d'échange pour {demande.SeanceDemandeur?.Matiere?.Nom ?? $"séance #{demande.SeanceDemandeurId}"} a été refusée par {demande.Cible?.Prenom} {demande.Cible?.Nom}."
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Échec de la notification de refus pour la demande {Id}", id);
            }

            return MapToReadDtoSync(demande);
        }

        private DemandeEchangeReadDto MapToReadDtoSync(DemandeEchange d)
            => BuildDto(d, d.Demandeur, d.Cible);

        private static DemandeEchangeReadDto BuildDto(
            DemandeEchange d,
            Utilisateur? demandeur,
            Utilisateur? cible)
        => new()
        {
            Id = d.Id,
            DemandeurId = d.DemandeurId,
            NomDemandeur = demandeur != null
                ? $"{demandeur.Prenom} {demandeur.Nom}" : "",
            CibleId = d.CibleId,
            NomCible = cible != null
                ? $"{cible.Prenom} {cible.Nom}" : "",
            SeanceDemandeurId = d.SeanceDemandeurId,
            SeanceDemandeurMatiere = d.SeanceDemandeur?.Matiere?.Nom ?? $"Séance #{d.SeanceDemandeurId}",
            SeanceCibleId = d.SeanceCibleId,
            SeanceCibleMatiere = d.SeanceCible?.Matiere?.Nom ?? $"Séance #{d.SeanceCibleId}",
            Statut = d.Statut,
            Motif = d.Motif,
            DateDemande = d.DateDemande,
            DateReponse = d.DateReponse
        };
    }
}