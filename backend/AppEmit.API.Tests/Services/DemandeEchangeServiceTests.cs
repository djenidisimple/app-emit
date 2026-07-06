using Microsoft.EntityFrameworkCore;
using Moq;
using FluentAssertions;
using AppEmit.API.Data;
using AppEmit.API.DTOs.DemandeEchange;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using AppEmit.API.Services;
using AppEmit.API.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace AppEmit.API.Tests.Services;

public class DemandeEchangeServiceTests : TestBase
{
    private readonly Mock<INotificationService> _notifMock;
    private readonly Mock<ILogger<DemandeEchangeService>> _loggerMock;

    public DemandeEchangeServiceTests()
    {
        _notifMock = new Mock<INotificationService>();
        _loggerMock = new Mock<ILogger<DemandeEchangeService>>();
    }

    [Fact]
    public async Task CreerDemande_WithValidData_ShouldCreateExchangeRequest()
    {
        using var context = CreateContext();
        var (prof1, prof2, seance1, seance2) = await SeedData(context);
        var httpMock = CreateHttpContext(prof1.Id);
        var service = new DemandeEchangeService(context, _loggerMock.Object, httpMock.Object, _notifMock.Object);

        var dto = new DemandeEchangeCreateDto
        {
            DemandeurId = prof1.Id,
            CibleId = prof2.Id,
            SeanceDemandeurId = seance1.Id,
            SeanceCibleId = seance2.Id,
            Motif = "Test d'échange"
        };

        var result = await service.CreerDemande(dto);

        result.Should().NotBeNull();
        result.Statut.Should().Be("EnAttente");
        result.SeanceDemandeurMatiere.Should().Be("Génie Logiciel");
        result.SeanceCibleMatiere.Should().Be("Base de Données");
        result.DemandeurId.Should().Be(prof1.Id);
        result.CibleId.Should().Be(prof2.Id);

        _notifMock.Verify(n => n.CreateAsync(It.Is<DTOs.Notification.NotificationCreateDto>(
            d => d.UtilisateurId == prof2.Id)), Times.Once);
    }

    [Fact]
    public async Task CreerDemande_WithWrongUser_ShouldThrowUnauthorizedException()
    {
        using var context = CreateContext();
        var (prof1, prof2, seance1, seance2) = await SeedData(context);
        var httpMock = CreateHttpContext(999);
        var service = new DemandeEchangeService(context, _loggerMock.Object, httpMock.Object, _notifMock.Object);

        var dto = new DemandeEchangeCreateDto
        {
            DemandeurId = prof1.Id,
            CibleId = prof2.Id,
            SeanceDemandeurId = seance1.Id,
            SeanceCibleId = seance2.Id,
        };

        await FluentActions
            .Awaiting(() => service.CreerDemande(dto))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task CreerDemande_WithNonOwnedSeance_ShouldThrowUnauthorizedException()
    {
        using var context = CreateContext();
        var (prof1, prof2, seance1, seance2) = await SeedData(context);
        var httpMock = CreateHttpContext(prof2.Id);
        var service = new DemandeEchangeService(context, _loggerMock.Object, httpMock.Object, _notifMock.Object);

        var dto = new DemandeEchangeCreateDto
        {
            DemandeurId = prof2.Id,
            CibleId = prof1.Id,
            SeanceDemandeurId = seance1.Id,
            SeanceCibleId = seance2.Id,
        };

        await FluentActions
            .Awaiting(() => service.CreerDemande(dto))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task AccepterDemande_ShouldSwapProfessorsAndNotify()
    {
        using var context = CreateContext();
        var (prof1, prof2, seance1, seance2) = await SeedData(context);
        var httpMock = CreateHttpContext(prof1.Id);
        var service = new DemandeEchangeService(context, _loggerMock.Object, httpMock.Object, _notifMock.Object);

        var dto = new DemandeEchangeCreateDto
        {
            DemandeurId = prof1.Id, CibleId = prof2.Id,
            SeanceDemandeurId = seance1.Id, SeanceCibleId = seance2.Id,
        };
        var demande = await service.CreerDemande(dto);

        var httpMockCible = CreateHttpContext(prof2.Id);
        var serviceCible = new DemandeEchangeService(context, _loggerMock.Object, httpMockCible.Object, _notifMock.Object);

        var result = await serviceCible.AccepterDemande(demande.Id);

        result.Statut.Should().Be("Acceptee");

        var seance1Reloaded = await context.SeancesCours.FindAsync(seance1.Id);
        var seance2Reloaded = await context.SeancesCours.FindAsync(seance2.Id);
        seance1Reloaded!.ProfesseurId.Should().Be(prof2.Id);
        seance2Reloaded!.ProfesseurId.Should().Be(prof1.Id);

        _notifMock.Verify(n => n.CreateAsync(It.Is<DTOs.Notification.NotificationCreateDto>(
            d => d.UtilisateurId == prof1.Id && d.Message.Contains("acceptée"))), Times.Once);
    }

    [Fact]
    public async Task RefuserDemande_ShouldUpdateStatutAndNotify()
    {
        using var context = CreateContext();
        var (prof1, prof2, seance1, seance2) = await SeedData(context);
        var httpMock = CreateHttpContext(prof1.Id);
        var service = new DemandeEchangeService(context, _loggerMock.Object, httpMock.Object, _notifMock.Object);

        var dto = new DemandeEchangeCreateDto
        {
            DemandeurId = prof1.Id, CibleId = prof2.Id,
            SeanceDemandeurId = seance1.Id, SeanceCibleId = seance2.Id,
        };
        var demande = await service.CreerDemande(dto);

        var httpMockCible = CreateHttpContext(prof2.Id);
        var serviceCible = new DemandeEchangeService(context, _loggerMock.Object, httpMockCible.Object, _notifMock.Object);

        var result = await serviceCible.RefuserDemande(demande.Id);

        result.Statut.Should().Be("Refusee");

        _notifMock.Verify(n => n.CreateAsync(It.Is<DTOs.Notification.NotificationCreateDto>(
            d => d.UtilisateurId == prof1.Id && d.Message.Contains("refusée"))), Times.Once);
    }

    [Fact]
    public async Task ObtenirDemandes_ShouldReturnRelevantDemandes()
    {
        using var context = CreateContext();
        var (prof1, prof2, seance1, seance2) = await SeedData(context);
        var httpMock = CreateHttpContext(prof1.Id);
        var service = new DemandeEchangeService(context, _loggerMock.Object, httpMock.Object, _notifMock.Object);

        var dto = new DemandeEchangeCreateDto
        {
            DemandeurId = prof1.Id, CibleId = prof2.Id,
            SeanceDemandeurId = seance1.Id, SeanceCibleId = seance2.Id,
        };
        await service.CreerDemande(dto);

        var demandes = await service.ObtenirDemandes(prof1.Id);
        demandes.Should().HaveCount(1);
        demandes[0].SeanceDemandeurMatiere.Should().Be("Génie Logiciel");
        demandes[0].SeanceCibleMatiere.Should().Be("Base de Données");
    }

    private static Mock<IHttpContextAccessor> CreateHttpContext(int userId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };
        var mock = new Mock<IHttpContextAccessor>();
        mock.Setup(m => m.HttpContext).Returns(httpContext);
        return mock;
    }

    private static async Task<(Utilisateur, Utilisateur, SeanceCours, SeanceCours)> SeedData(AppDbContext context)
    {
        var matiere1 = new Matiere { Code = "INF401", Nom = "Génie Logiciel" };
        var matiere2 = new Matiere { Code = "INF402", Nom = "Base de Données" };
        context.Matieres.AddRange(matiere1, matiere2);

        var salle = new Salle { CodeSalle = "A101", Nom = "Salle A101", Libelle = "Salle A101", Capacite = 30 };
        context.Salles.Add(salle);

        var creneau = new Creneau { Jour = "Lundi", HeureDebut = new TimeSpan(8, 0, 0), HeureFin = new TimeSpan(10, 0, 0) };
        context.Creneaux.Add(creneau);

        var prof1 = new Utilisateur
        {
            Nom = "Rakoto", Prenom = "Jean", Email = "prof1@test.mg",
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("pass"),
            Role = "Professeur"
        };
        var prof2 = new Utilisateur
        {
            Nom = "Rabe", Prenom = "Marie", Email = "prof2@test.mg",
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("pass"),
            Role = "Professeur"
        };
        context.Utilisateurs.AddRange(prof1, prof2);
        await context.SaveChangesAsync();

        var seance1 = new SeanceCours
        {
            MatiereId = matiere1.Id, ProfesseurId = prof1.Id,
            SalleId = salle.Id, CreneauId = creneau.Id,
            DateDebutAnnee = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc),
            DateFinAnnee = new DateTime(2027, 6, 30, 0, 0, 0, DateTimeKind.Utc)
        };
        var seance2 = new SeanceCours
        {
            MatiereId = matiere2.Id, ProfesseurId = prof2.Id,
            SalleId = salle.Id, CreneauId = creneau.Id,
            DateDebutAnnee = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc),
            DateFinAnnee = new DateTime(2027, 6, 30, 0, 0, 0, DateTimeKind.Utc)
        };
        context.SeancesCours.AddRange(seance1, seance2);
        await context.SaveChangesAsync();

        return (prof1, prof2, seance1, seance2);
    }
}