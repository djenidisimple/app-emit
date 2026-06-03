using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

using FluentValidation;
using FluentValidation.AspNetCore;

using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Hubs;
using AppEmit.API.Interfaces;
using AppEmit.API.Mappings;
using AppEmit.API.Middleware;
using AppEmit.API.Repositories;
using AppEmit.API.Services;
using AppEmit.API.Validators;

// Load environment variables from .env file
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// DATABASE
// ======================================================
var connectionString = $"Host={Environment.GetEnvironmentVariable("HOST")};" +
                       $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
                       $"Database={Environment.GetEnvironmentVariable("DATABASENAME")};" +
                       $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")}";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        connectionString,
        npgsql => npgsql.MigrationsAssembly(typeof(Program).Assembly.GetName().Name)
    )
);

// ======================================================
// CONTROLLERS + SWAGGER
// ======================================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ======================================================
// CORS
// ======================================================
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ======================================================
// SIGNALR
// ======================================================
builder.Services.AddSignalR();

// ======================================================
// AUTOMAPPER
// ======================================================
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(NotificationMappingProfile).Assembly);
});

// ======================================================
// FLUENT VALIDATION
// ======================================================
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<NotificationCreateDtoValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<LoginDtoValidator>();

// ======================================================
// AUTH JWT
// ======================================================
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("La clé secrète JWT (JWT_KEY) est absente du fichier .env ou des variables d'environnement.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };

    // FIX: Allow SignalR to pass JWT via query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// ======================================================
// RATE LIMITING
// ======================================================
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("Auth", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("Strict", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// ======================================================
// REPOSITORIES & SERVICES
// ======================================================
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUtilisateurRepository, UtilisateurRepository>();
builder.Services.AddScoped<ISalleRepository, SalleRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IMatiereRepository, MatiereRepository>();
builder.Services.AddScoped<IParcoursRepository, ParcoursRepository>();
builder.Services.AddScoped<ISeanceCoursRepository, SeanceCoursRepository>();
builder.Services.AddScoped<IExceptionPlanningRepository, ExceptionPlanningRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<ISeanceCoursService, SeanceCoursService>();
builder.Services.AddScoped<IUtilisateurService, UtilisateurService>();
builder.Services.AddScoped<INiveauService, NiveauService>();
builder.Services.AddScoped<IFiliereService, FiliereService>();
builder.Services.AddScoped<ISalleService, SalleService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IMatiereService, MatiereService>();
builder.Services.AddScoped<IParcoursService, ParcoursService>();
builder.Services.AddScoped<IExceptionService, ExceptionService>();
builder.Services.AddScoped<IPlanningHebdoService, PlanningHebdoService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IDemandeEchangeService, DemandeEchangeService>();

// (Les services Matière & Parcours sont déjà enregistrés ci-dessus)

// ======================================================
// BUILD APP
// ======================================================
var app = builder.Build();

// Appliquer les migrations automatiquement au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ======================================================
// MIDDLEWARE
// ======================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowNextJs");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR Hub
app.MapHub<NotificationHub>("/hubs/notifications");

// ======================================================
// SEEDING
// ======================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    if (!context.Filieres.Any())
    {
        // ── Filières & Parcours & Niveaux ──
        var filiere = new Filiere { Nom = "Informatique et Management" };
        context.Filieres.Add(filiere);
        context.SaveChanges();

        var parcoursInfo = new Parcours { Nom = "Informatique", FiliereId = filiere.Id };
        var parcoursManagement = new Parcours { Nom = "Management", FiliereId = filiere.Id };
        context.Parcours.AddRange(parcoursInfo, parcoursManagement);
        context.SaveChanges();

        var niveaux = new List<Niveau>
        {
            new Niveau { Code = "L1", ParcoursId = parcoursInfo.Id },
            new Niveau { Code = "L2", ParcoursId = parcoursInfo.Id },
            new Niveau { Code = "L3", ParcoursId = parcoursInfo.Id },
            new Niveau { Code = "M1", ParcoursId = parcoursInfo.Id },
            new Niveau { Code = "M2", ParcoursId = parcoursInfo.Id }
        };
        context.Niveaux.AddRange(niveaux);
        context.SaveChanges();
        Console.WriteLine("[SEED] Filières, Parcours et Niveaux créés !");
    }

    if (!context.Creneaux.Any())
    {
        var jours = new[] { "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" };
        var creneaux = new List<Creneau>();
        foreach (var jour in jours)
        {
            creneaux.Add(new Creneau { Jour = jour, HeureDebut = new TimeSpan(8, 0, 0), HeureFin = new TimeSpan(10, 0, 0) });
            creneaux.Add(new Creneau { Jour = jour, HeureDebut = new TimeSpan(10, 0, 0), HeureFin = new TimeSpan(12, 0, 0) });
            creneaux.Add(new Creneau { Jour = jour, HeureDebut = new TimeSpan(14, 0, 0), HeureFin = new TimeSpan(16, 0, 0) });
            creneaux.Add(new Creneau { Jour = jour, HeureDebut = new TimeSpan(16, 0, 0), HeureFin = new TimeSpan(18, 0, 0) });
        }
        context.Creneaux.AddRange(creneaux);
        context.SaveChanges();
        Console.WriteLine("[SEED] Créneaux créés !");
    }

    if (!context.Salles.Any())
    {
        var salles = new List<Salle>
        {
            new Salle { CodeSalle = "A101", Libelle = "Amphi 1", Nom = "Amphi 1", Capacite = 150, Type = "Amphi", EstActive = true, EstDisponible = true },
            new Salle { CodeSalle = "A102", Libelle = "Amphi 2", Nom = "Amphi 2", Capacite = 100, Type = "Amphi", EstActive = true, EstDisponible = true },
            new Salle { CodeSalle = "TP01", Libelle = "Labo Info 1", Nom = "Labo Info 1", Capacite = 30, Type = "TP", EstActive = true, EstDisponible = true },
            new Salle { CodeSalle = "TP02", Libelle = "Labo Info 2", Nom = "Labo Info 2", Capacite = 30, Type = "TP", EstActive = true, EstDisponible = true },
            new Salle { CodeSalle = "TD01", Libelle = "Salle TD 1", Nom = "Salle TD 1", Capacite = 40, Type = "TD", EstActive = true, EstDisponible = true },
            new Salle { CodeSalle = "TD02", Libelle = "Salle TD 2", Nom = "Salle TD 2", Capacite = 40, Type = "TD", EstActive = true, EstDisponible = true },
        };
        context.Salles.AddRange(salles);
        context.SaveChanges();
        Console.WriteLine("[SEED] Salles créées !");
    }

    if (!context.Matieres.Any())
    {
        var matieres = new List<Matiere>
        {
            new Matiere { Code = "INF401", Nom = "Génie Logiciel", Type = "Cours" },
            new Matiere { Code = "INF402", Nom = "Base de Données", Type = "Cours" },
            new Matiere { Code = "INF403", Nom = "Réseaux", Type = "Cours" },
            new Matiere { Code = "INF404", Nom = "Programmation Web", Type = "Cours" },
            new Matiere { Code = "MGT401", Nom = "Management", Type = "Cours" },
        };
        context.Matieres.AddRange(matieres);
        context.SaveChanges();
        Console.WriteLine("[SEED] Matières créées !");
    }

    if (!context.Utilisateurs.Any())
    {
        var adminRole = new Role { Nom = "Admin" };
        var profRole = new Role { Nom = "Professeur" };
        var etudiantRole = new Role { Nom = "Etudiant" };
        context.Roles.AddRange(adminRole, profRole, etudiantRole);
        context.SaveChanges();

        var admin = new Utilisateur
        {
            Nom = "Admin", Prenom = "System", Email = "admin@emit.mg",
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
            Role = "Admin", Matricule = "ADM001",
            Roles = new List<Role> { adminRole }
        };
        var prof1 = new Utilisateur
        {
            Nom = "Rakoto", Prenom = "Jean", Email = "prof1@emit.mg",
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("prof123"),
            Role = "Professeur", Matricule = "PROF001",
            Roles = new List<Role> { profRole }
        };
        var prof2 = new Utilisateur
        {
            Nom = "Rabe", Prenom = "Marie", Email = "prof2@emit.mg",
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("prof123"),
            Role = "Professeur", Matricule = "PROF002",
            Roles = new List<Role> { profRole }
        };
        var etudiant = new Utilisateur
        {
            Nom = "Randria", Prenom = "Faly", Email = "etudiant@emit.mg",
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"),
            Role = "Etudiant", Matricule = "ETU001",
            NiveauId = context.Niveaux.FirstOrDefault()?.Id,
            Roles = new List<Role> { etudiantRole }
        };
        context.Utilisateurs.AddRange(admin, prof1, prof2, etudiant);
        context.SaveChanges();
        Console.WriteLine("[SEED] Utilisateurs créés (admin@emit.mg / Admin@1234, prof1@emit.mg / prof123, etudiant@emit.mg / etud123) !");
    }
}

app.Run();
