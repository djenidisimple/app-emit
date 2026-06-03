using AppEmit.API.Data;
using AppEmit.API.DTOs.DemandeEchange;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Services
{
    public class DemandeEchangeService : IDemandeEchangeService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DemandeEchangeService> _logger;

        public DemandeEchangeService(AppDbContext context,
            ILogger<DemandeEchangeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<DemandeEchangeReadDto> CreerDemande(
            DemandeEchangeCreateDto dto)
        {
            // Vérifier que les séances existent
            var seanceDemandeur = await _context.SeancesCours
                .FindAsync(dto.SeanceDemandeurId)
                ?? throw new NotFoundException("Séance du demandeur introuvable.");

            var seanceCible = await _context.SeancesCours
                .FindAsync(dto.SeanceCibleId)
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

            return await MapToReadDto(demande);
        }

        public async Task<List<DemandeEchangeReadDto>> ObtenirDemandes(
            int professeurId)
        {
            var demandes = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
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
                .FirstOrDefaultAsync(d => d.Id == id);

            if (demande == null) return null;

            return MapToReadDtoSync(demande);
        }

        public async Task<DemandeEchangeReadDto> AccepterDemande(int id)
        {
            var demande = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new NotFoundException("Demande introuvable.");

            if (demande.Statut != "EnAttente")
                throw new Exception("Cette demande a déjà été traitée.");

            // FIX: Use transaction for the swap operation
            using var transaction = await _context.Database.BeginTransactionAsync();

            var seanceDemandeur = await _context.SeancesCours
                .FindAsync(demande.SeanceDemandeurId)!;
            var seanceCible = await _context.SeancesCours
                .FindAsync(demande.SeanceCibleId)!;

            (seanceDemandeur!.ProfesseurId, seanceCible!.ProfesseurId) =
                (seanceCible.ProfesseurId, seanceDemandeur.ProfesseurId);

            demande.Statut = "Acceptee";
            demande.DateReponse = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            _logger.LogInformation("Demande {Id} acceptée, échange effectué.", id);

            return MapToReadDtoSync(demande);
        }

        public async Task<DemandeEchangeReadDto> RefuserDemande(int id)
        {
            var demande = await _context.DemandesEchange
                .Include(d => d.Demandeur)
                .Include(d => d.Cible)
                .FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new NotFoundException("Demande introuvable.");

            if (demande.Statut != "EnAttente")
                throw new Exception("Cette demande a déjà été traitée.");

            demande.Statut = "Refusee";
            demande.DateReponse = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Demande {Id} refusée.", id);

            return MapToReadDtoSync(demande);
        }

        // Helpers
        private async Task<DemandeEchangeReadDto> MapToReadDto(
            DemandeEchange d)
        {
            var demandeur = await _context.Utilisateurs.FindAsync(d.DemandeurId);
            var cible = await _context.Utilisateurs.FindAsync(d.CibleId);
            return BuildDto(d, demandeur, cible);
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
            SeanceCibleId = d.SeanceCibleId,
            Statut = d.Statut,
            Motif = d.Motif,
            DateDemande = d.DateDemande,
            DateReponse = d.DateReponse
        };
    }
}