using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces;

public interface INotificationRepository : IGenericRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUtilisateurIdAsync(int utilisateurId, int page, int pageSize);
    Task<bool> MarquerCommeLuAsync(int id);
    Task<int> CountNonLuesAsync(int utilisateurId);
}
