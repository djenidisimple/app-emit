using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories;

public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    private readonly ILogger<NotificationRepository> _logger;

    public NotificationRepository(AppDbContext context, ILogger<NotificationRepository> logger) : base(context)
    {
        _logger = logger;
    }

    public async Task<IEnumerable<Notification>> GetByUtilisateurIdAsync(int utilisateurId, int page, int pageSize)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(n => n.UtilisateurId == utilisateurId)
            .OrderByDescending(n => n.DateEnvoi)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<bool> MarquerCommeLuAsync(int id)
    {
        var rows = await _dbSet
            .Where(n => n.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.EstLu, true));
        return rows > 0;
    }

    public async Task<bool> MarquerToutCommeLuAsync(int utilisateurId)
    {
        var rows = await _dbSet
            .Where(n => n.UtilisateurId == utilisateurId && !n.EstLu)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.EstLu, true));
        return rows > 0;
    }

    public async Task<int> CountNonLuesAsync(int utilisateurId)
    {
        return await _dbSet
            .CountAsync(n => n.UtilisateurId == utilisateurId && !n.EstLu);
    }
}
