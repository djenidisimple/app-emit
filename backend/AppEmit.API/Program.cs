using Microsoft.EntityFrameworkCore;

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
using AppEmit.Interfaces;
using AppEmit.Repositories;
using AppEmit.Services;

// Librairies
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// -------------------- DATABASE --------------------
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

var app = builder.Build();

// -------------------- MIDDLEWARE --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ton middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowNextJs");

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