using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD
using Microsoft.AspNetCore.Authentication.JwtBearer; // ← AJOUTER
using Microsoft.IdentityModel.Tokens;                // ← AJOUTER
using System.Text;                                   // ← AJOUTER
using AppEmit.Data;
using AppEmit.API.Interfaces;                        // ← AJOUTER
using AppEmit.API.Services;   
=======
<<<<<<< HEAD
>>>>>>> main
using AppEmit.Data;
=======

// Ton projet
using AppEmit.API.Data;
using AppEmit.API.Hubs;
using AppEmit.API.Interfaces;
using AppEmit.API.Mappings;
using AppEmit.API.Middleware;
using AppEmit.API.Repositories;
using AppEmit.API.Services;
using AppEmit.API.Validators;

// Projet existant
>>>>>>> 9eca40bf3e5eaafb17f40a140af158b771739f6e
using AppEmit.Interfaces;
using AppEmit.Repositories;
using AppEmit.Services;

<<<<<<< HEAD
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
=======
// Librairies
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// -------------------- DATABASE --------------------
>>>>>>> 9eca40bf3e5eaafb17f40a140af158b771739f6e
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MigrationsAssembly("AppEmit.API")
    ));

// -------------------- DEPENDENCY INJECTION --------------------

// Notifications
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Salle + Generic
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ISalleRepository, SalleRepository>();
builder.Services.AddScoped<ISalleService, SalleService>();

// -------------------- AUTOMAPPER --------------------
builder.Services.AddAutoMapper(typeof(NotificationMappingProfile).Assembly);

// -------------------- VALIDATION --------------------
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<NotificationCreateDtoValidator>();

// -------------------- SIGNALR --------------------
builder.Services.AddSignalR();

// -------------------- CORS --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
        policy.WithOrigins("http://localhost:3000", "https://emit.univ.mg")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// -------------------- CONTROLLERS --------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------- AUTH JWT --------------------
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
    });

builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ISalleRepository, SalleRepository>();
builder.Services.AddScoped<ISalleService, SalleService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

// ← AJOUTER controllers
builder.Services.AddControllers();

var app = builder.Build();

// -------------------- MIDDLEWARE --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

<<<<<<< HEAD
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
=======
// Ton middleware
app.UseMiddleware<ExceptionMiddleware>();
>>>>>>> main

app.UseHttpsRedirection();
<<<<<<< HEAD
app.UseAuthorization();
app.MapControllers();
=======
app.UseCors("AllowNextJs");
>>>>>>> 9eca40bf3e5eaafb17f40a140af158b771739f6e

// Auth
app.UseAuthentication();
app.UseAuthorization();

// -------------------- ROUTES --------------------
app.MapControllers();

// SignalR
app.MapHub<NotificationHub>("/hubs/notifications");

// ❌ Supprimé : WeatherForecast (inutile en prod)

// -------------------- RUN --------------------
app.Run();