using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using FluentValidation;
using FluentValidation.AspNetCore;

// Data
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
});

builder.Services.AddAuthorization();

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

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISalleService, SalleService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IMatiereService, MatiereService>();
builder.Services.AddScoped<IParcoursService, ParcoursService>();
builder.Services.AddScoped<IExceptionService, ExceptionService>();
builder.Services.AddScoped<IPlanningHebdoService, PlanningHebdoService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

// ======================================================
// BUILD APP
// ======================================================
var app = builder.Build();

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
        Console.WriteLine("[SEED] Niveaux et Parcours créés avec succès !");
    }
}

app.Run();
