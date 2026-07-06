using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using FluentAssertions;
using AppEmit.API.Data;
using AppEmit.API.DTOs.Auth;
using AppEmit.API.Entities;
using AppEmit.API.Exceptions;
using AppEmit.API.Services;
using AppEmit.API.Tests.Helpers;

namespace AppEmit.API.Tests.Services;

public class AuthServiceTests : TestBase
{
    private readonly Mock<IConfiguration> _configMock;

    public AuthServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _configMock.Setup(c => c["Jwt:Key"]).Returns("bto+K7YIAXPQKSQNv9a523+8EpGN0bAQniOsrzYiU0Y=");
        _configMock.Setup(c => c["Jwt:Issuer"]).Returns("AppEmit.API");
        _configMock.Setup(c => c["Jwt:Audience"]).Returns("AppEmit.Frontend");
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUser()
    {
        using var context = CreateContext();
        var service = new AuthService(context, _configMock.Object);

        var dto = new RegisterDto
        {
            Nom = "Test",
            Prenom = "User",
            Email = "test@emit.mg",
            MotDePasse = "password123",
            Role = "Professeur"
        };

        var result = await service.RegisterAsync(dto);

        result.Should().NotBeNull();
        result.Email.Should().Be("test@emit.mg");
        result.Nom.Should().Be("Test");
        result.Prenom.Should().Be("User");
        result.Token.Should().NotBeNullOrEmpty();

        var user = await context.Utilisateurs.FirstOrDefaultAsync(u => u.Email == "test@emit.mg");
        user.Should().NotBeNull();
        user!.Nom.Should().Be("Test");
    }

    [Fact]
    public async Task RegisterAsync_WithDuplicateEmail_ShouldThrowConflictException()
    {
        using var context = CreateContext();
        var service = new AuthService(context, _configMock.Object);

        var dto = new RegisterDto
        {
            Nom = "Test", Prenom = "User",
            Email = "test@emit.mg", MotDePasse = "password123",
            Role = "Etudiant"
        };

        await service.RegisterAsync(dto);

        await FluentActions
            .Awaiting(() => service.RegisterAsync(dto))
            .Should().ThrowAsync<ConflictException>()
            .WithMessage("*email*existe*");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnToken()
    {
        using var context = CreateContext();
        var service = new AuthService(context, _configMock.Object);

        await SeedUser(context, "login@emit.mg", "password123", "Admin");

        var dto = new LoginDto { Email = "login@emit.mg", MotDePasse = "password123" };
        var result = await service.LoginAsync(dto);

        result.Should().NotBeNull();
        result.Email.Should().Be("login@emit.mg");
        result.Token.Should().NotBeNullOrEmpty();
        result.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ShouldThrowUnauthorizedException()
    {
        using var context = CreateContext();
        var service = new AuthService(context, _configMock.Object);

        await SeedUser(context, "wrongpwd@emit.mg", "correctpwd", "Etudiant");

        var dto = new LoginDto { Email = "wrongpwd@emit.mg", MotDePasse = "wrongpwd" };

        await FluentActions
            .Awaiting(() => service.LoginAsync(dto))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_WithNonExistentEmail_ShouldThrowUnauthorizedException()
    {
        using var context = CreateContext();
        var service = new AuthService(context, _configMock.Object);

        var dto = new LoginDto { Email = "nobody@emit.mg", MotDePasse = "password123" };

        await FluentActions
            .Awaiting(() => service.LoginAsync(dto))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    private static async Task SeedUser(AppDbContext context, string email, string password, string role)
    {
        var roleEntity = new Role { Nom = role };
        context.Roles.Add(roleEntity);
        await context.SaveChangesAsync();

        var user = new Utilisateur
        {
            Nom = "Seed", Prenom = "User",
            Email = email,
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            Roles = new List<Role> { roleEntity }
        };
        context.Utilisateurs.Add(user);
        await context.SaveChangesAsync();
    }
}