using System.Collections.Generic;
using System.Threading.Tasks;
using AppEmit.API.DTOs.Notification;

using System.Collections.Generic;
using System.Threading.Tasks;
using AppEmit.API.DTOs.Notification;

namespace AppEmit.API.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationReadDto> CreateAsync(NotificationCreateDto dto);
        Task<NotificationReadDto?> GetByIdAsync(int id);
        Task<IEnumerable<NotificationReadDto>> GetAllAsync();
        Task<IEnumerable<NotificationReadDto>> GetByUtilisateurIdAsync(int utilisateurId, int page, int pageSize);
        Task<bool> MarquerCommeLuAsync(int id);
        Task<bool> UpdateAsync(int id, NotificationCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
