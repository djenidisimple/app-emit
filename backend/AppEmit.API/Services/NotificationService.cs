using AppEmit.API.Interfaces;
using AppEmit.Data;
using AppEmit.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task EnvoyerNotificationAsync(int utilisateurId, string message)
        {
            var notif = new Notification
            {
                UtilisateurId = utilisateurId,
                Message = message,
                DateEnvoi = DateTime.UtcNow,
                EstLu = false
            };
            _context.Notifications.Add(notif);
            await _context.SaveChangesAsync();
        }

        public async Task EnvoyerNotificationsBulkAsync(List<int> utilisateurIds, string message)
        {
            var notifications = utilisateurIds.Select(id => new Notification
            {
                UtilisateurId = id,
                Message = message,
                DateEnvoi = DateTime.UtcNow,
                EstLu = false
            });
            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}