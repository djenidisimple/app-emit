using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using FluentValidation;
using FluentValidation.AspNetCore;

// Data
using AppEmit.Data;

// Core App
using AppEmit.Entities;
using AppEmit.Interfaces;
using AppEmit.Repositories;

// API Layer
using AppEmit.API.Hubs;
using AppEmit.API.Interfaces;
using AppEmit.API.Mappings;
using AppEmit.API.Middleware;
using AppEmit.API.Repositories;
using AppEmit.API.Services;
using AppEmit.API.Validators;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// DATABASE
// ======================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MigrationsAssembly("AppEmit.API")
    )
);

// ======================================================
// CONTROLLERS + SWAGGER
// ======================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ======================================================
// CORS
// ======================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
        policy.WithOrigins("http://localhost:3000", "https://emit.univ.mg")
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
builder.Services.AddAutoMapper(typeof(NotificationMappingProfile).Assembly);

// ======================================================
// FLUENT VALIDATION
// ======================================================
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<NotificationCreateDtoValidator>();

// ======================================================
// AUTH JWT
// ======================================================
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
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };
});

builder.Services.AddAuthorization();

// ======================================================
// DEPENDENCY INJECTION
// ======================================================

// Generic
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

// Salle
builder.Services.AddScoped<ISalleRepository, SalleRepository>();
builder.Services.AddScoped<ISalleService, SalleService>();

// Auth / Documents
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

// Notifications
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Planning / Exceptions (feature #38 & #39)
builder.Services.AddScoped<ISeanceCoursRepository, SeanceCoursRepository>();
builder.Services.AddScoped<IExceptionPlanningRepository, ExceptionPlanningRepository>();
builder.Services.AddScoped<IPlanningHebdoService, PlanningHebdoService>();

builder.Services.AddScoped<IExceptionService, ExceptionService>();
builder.Services.AddScoped<IUtilisateurRepository, UtilisateurRepository>();

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
// RUN
// ======================================================
app.Run();