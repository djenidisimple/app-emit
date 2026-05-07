using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUtilisateurIdAsync(int utilisateurId, int page, int pageSize);
    Task<Notification?> GetByIdAsync(int id);
    Task<Notification> CreateAsync(Notification notification);
    Task<bool> MarquerCommeLuAsync(int id);
    Task<bool> DeleteAsync(int id);
    Task<int> CountNonLuesAsync(int utilisateurId);
}