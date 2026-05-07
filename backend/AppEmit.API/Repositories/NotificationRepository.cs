using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<NotificationRepository> _logger;

    public NotificationRepository(AppDbContext context, ILogger<NotificationRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Notification>> GetByUtilisateurIdAsync(int utilisateurId, int page, int pageSize)
    {
        return await _context.Notifications
            .AsNoTracking()
            .Where(n => n.UtilisateurId == utilisateurId)
            .OrderByDescending(n => n.DateEnvoi)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(int id)
    {
        return await _context.Notifications
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<Notification> CreateAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Notification créée (Id={Id}) pour UtilisateurId={UserId}", notification.Id, notification.UtilisateurId);
        return notification;
    }

    public async Task<bool> MarquerCommeLuAsync(int id)
    {
        var rows = await _context.Notifications
            .Where(n => n.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.EstLu, true));
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rows = await _context.Notifications
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();
        return rows > 0;
    }

    public async Task<int> CountNonLuesAsync(int utilisateurId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UtilisateurId == utilisateurId && !n.EstLu);
    }
}