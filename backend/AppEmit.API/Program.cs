using Microsoft.EntityFrameworkCore;
using AppEmit.Data;
using AppEmit.API.Interfaces;
using AppEmit.API.Repositories;
using AppEmit.API.Services;
using AppEmit.Interfaces;
using AppEmit.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dépendances existantes
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

// Repository pour l'interface simple de la tâche #39 (évite conflit avec l'autre ISalleRepository)
builder.Services.AddScoped<AppEmit.API.Interfaces.ISalleRepository, AppEmit.API.Repositories.SalleRepository>();

// Tâche #38
builder.Services.AddScoped<ISeanceCoursRepository, SeanceCoursRepository>();
builder.Services.AddScoped<IExceptionPlanningRepository, ExceptionPlanningRepository>();
builder.Services.AddScoped<IPlanningHebdoService, PlanningHebdoService>();

// Tâche #39
builder.Services.AddScoped<IExceptionService, ExceptionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUtilisateurRepository, UtilisateurRepository>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();