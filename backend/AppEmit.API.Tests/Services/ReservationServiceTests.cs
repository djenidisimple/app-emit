using Moq;
using FluentAssertions;
using AppEmit.API.DTOs.Reservation;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Interfaces;
using AppEmit.API.Services;
using AppEmit.API.Tests.Helpers;
using Microsoft.Extensions.Logging;
using AutoMapper;

namespace AppEmit.API.Tests.Services;

public class ReservationServiceTests : TestBase
{
    private readonly Mock<IReservationRepository> _resRepoMock;
    private readonly Mock<IGenericRepository<Evenement>> _evtRepoMock;
    private readonly Mock<ISalleRepository> _salleRepoMock;
    private readonly Mock<INotificationService> _notifMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<ReservationService>> _loggerMock;

    public ReservationServiceTests()
    {
        _resRepoMock = new Mock<IReservationRepository>();
        _evtRepoMock = new Mock<IGenericRepository<Evenement>>();
        _salleRepoMock = new Mock<ISalleRepository>();
        _notifMock = new Mock<INotificationService>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<ReservationService>>();
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateReservation()
    {
        var salle = new Salle { Id = 1, CodeSalle = "A101", Nom = "Salle A101", Capacite = 30 };
        _salleRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(salle);
        _resRepoMock.Setup(r => r.HasConflictAsync(1, It.IsAny<DateTime>(), "Matin")).ReturnsAsync(false);

        var createdEvenement = new Evenement { Id = 1, Nom = "Test Event" };
        _evtRepoMock.Setup(r => r.AddAsync(It.IsAny<Evenement>())).ReturnsAsync(createdEvenement);

        var createdReservation = new Reservation { Id = 1, UtilisateurId = 1, EvenementId = 1, SalleId = 1, Statut = "En attente" };
        _resRepoMock.Setup(r => r.AddAsync(It.IsAny<Reservation>())).ReturnsAsync(createdReservation);

        _mapperMock.Setup(m => m.Map<ReservationReadDto>(It.IsAny<Reservation>()))
            .Returns(new ReservationReadDto { Id = 1, Titre = "Test Event", Statut = "En attente" });

        var service = new ReservationService(
            _resRepoMock.Object, _evtRepoMock.Object, _salleRepoMock.Object,
            _notifMock.Object, _mapperMock.Object, _loggerMock.Object);

        var dto = new ReservationCreateDto
        {
            Titre = "Test Event", Type = "Cours",
            DatePrecise = new DateTime(2026, 10, 15, 0, 0, 0, DateTimeKind.Utc),
            Session = "Matin", SalleId = 1
        };

        var result = await service.CreateAsync(1, dto);

        result.Should().NotBeNull();
        result.Titre.Should().Be("Test Event");
        _resRepoMock.Verify(r => r.AddAsync(It.IsAny<Reservation>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentSalle_ShouldThrowNotFoundException()
    {
        _salleRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Salle?)null);

        var service = new ReservationService(
            _resRepoMock.Object, _evtRepoMock.Object, _salleRepoMock.Object,
            _notifMock.Object, _mapperMock.Object, _loggerMock.Object);

        var dto = new ReservationCreateDto
        {
            Titre = "Test", Type = "Cours",
            DatePrecise = DateTime.UtcNow, Session = "Matin", SalleId = 99
        };

        await FluentActions
            .Awaiting(() => service.CreateAsync(1, dto))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateAsync_WithConflict_ShouldThrowBadRequestException()
    {
        var salle = new Salle { Id = 1, CodeSalle = "A101", Nom = "Salle A101", Capacite = 30 };
        _salleRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(salle);
        _resRepoMock.Setup(r => r.HasConflictAsync(1, It.IsAny<DateTime>(), "Matin")).ReturnsAsync(true);

        var service = new ReservationService(
            _resRepoMock.Object, _evtRepoMock.Object, _salleRepoMock.Object,
            _notifMock.Object, _mapperMock.Object, _loggerMock.Object);

        var dto = new ReservationCreateDto
        {
            Titre = "Test", Type = "Cours",
            DatePrecise = DateTime.UtcNow, Session = "Matin", SalleId = 1
        };

        await FluentActions
            .Awaiting(() => service.CreateAsync(1, dto))
            .Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task UpdateStatutAsync_ShouldNotifyUser()
    {
        var reservation = new Reservation
        {
            Id = 1, UtilisateurId = 1, EvenementId = 1, SalleId = 1,
            Statut = "En attente",
            Evenement = new Evenement { Nom = "Test Event" }
        };

        _resRepoMock.Setup(r => r.GetByIdWithIncludesAsync(1)).ReturnsAsync(reservation);
        _resRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Reservation>())).Returns(Task.CompletedTask);
        _notifMock.Setup(n => n.CreateAsync(It.IsAny<DTOs.Notification.NotificationCreateDto>()))
            .ReturnsAsync(new DTOs.Notification.NotificationReadDto());

        _mapperMock.Setup(m => m.Map<ReservationReadDto>(It.IsAny<Reservation>()))
            .Returns(new ReservationReadDto { Id = 1, Titre = "Test Event", Statut = "Confirmée" });

        var service = new ReservationService(
            _resRepoMock.Object, _evtRepoMock.Object, _salleRepoMock.Object,
            _notifMock.Object, _mapperMock.Object, _loggerMock.Object);

        var result = await service.UpdateStatutAsync(1, "Confirmée");

        result.Should().NotBeNull();
        result!.Statut.Should().Be("Confirmée");
        _notifMock.Verify(n => n.CreateAsync(It.Is<DTOs.Notification.NotificationCreateDto>(
            d => d.UtilisateurId == 1 && d.Message.Contains("confirmée"))), Times.Once);
    }
}