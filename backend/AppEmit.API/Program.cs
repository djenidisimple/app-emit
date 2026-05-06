using Microsoft.EntityFrameworkCore;
using AppEmit.Data;
using AppEmit.API.Interfaces;
using AppEmit.API.Repositories;
using AppEmit.API.Services;        // ← AJOUT OBLIGATOIRE pour PlanningHebdoService
using AppEmit.Services;            // services existants (SalleService...)
using AppEmit.Interfaces;          // interfaces existantes
using AppEmit.Repositories;        // repositories existants

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dépendances existantes
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ISalleRepository, SalleRepository>();
builder.Services.AddScoped<ISalleService, SalleService>();

// Tâche #38
builder.Services.AddScoped<ISeanceCoursRepository, SeanceCoursRepository>();
builder.Services.AddScoped<IExceptionPlanningRepository, ExceptionPlanningRepository>();
builder.Services.AddScoped<IPlanningHebdoService, PlanningHebdoService>();

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