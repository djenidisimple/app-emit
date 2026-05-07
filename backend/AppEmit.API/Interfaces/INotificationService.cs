using AppEmit.API.DTOs.Notification;

namespace AppEmit.API.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationReadDto>> GetNotificationsUtilisateurAsync(int utilisateurId, int page, int pageSize);
    Task<NotificationReadDto?> GetByIdAsync(int id);
    Task<NotificationReadDto> CreateNotificationAsync(NotificationCreateDto dto);
    Task<bool> MarquerCommeLuAsync(int id);
    Task<bool> DeleteNotificationAsync(int id);
    Task<int> GetCountNonLuesAsync(int utilisateurId);
}