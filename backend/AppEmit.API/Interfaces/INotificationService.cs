using System.Collections.Generic;
using System.Threading.Tasks;
using AppEmit.API.DTOs.Notification;

namespace AppEmit.API.Interfaces
{
    public interface INotificationService
    {
        // ======================================================
        // CREATE
        // ======================================================
        Task<NotificationReadDto> CreateNotificationAsync(NotificationCreateDto dto);

        // ======================================================
        // READ
        // ======================================================
        Task<IEnumerable<NotificationReadDto>> GetNotificationsUtilisateurAsync(
            int utilisateurId,
            int page,
            int pageSize);

        Task<NotificationReadDto?> GetByIdAsync(int id);

        // ======================================================
        // UPDATE
        // ======================================================
        Task<bool> MarquerCommeLuAsync(int id);

        // ======================================================
        // DELETE
        // ======================================================
        Task<bool> DeleteNotificationAsync(int id);

        // ======================================================
        // STATS
        // ======================================================
        Task<int> GetCountNonLuesAsync(int utilisateurId);
    }
}