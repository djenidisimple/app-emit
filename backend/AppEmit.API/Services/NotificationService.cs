using AutoMapper;
using AppEmit.API.DTOs.Notification;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using AppEmit.API.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(INotificationRepository notificationRepository, IMapper mapper, ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<NotificationReadDto> CreateAsync(NotificationCreateDto dto)
        {
            var notification = _mapper.Map<Notification>(dto);
            notification.DateEnvoi = DateTime.UtcNow;
            notification.EstLu = false;

            var createdNotification = await _notificationRepository.AddAsync(notification);
            _logger.LogInformation("Notification créée pour l'utilisateur {UserId}", notification.UtilisateurId);
            return _mapper.Map<NotificationReadDto>(createdNotification);
        }

        public async Task<NotificationReadDto?> GetByIdAsync(int id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            return notification == null ? null : _mapper.Map<NotificationReadDto>(notification);
        }

        public async Task<IEnumerable<NotificationReadDto>> GetAllAsync()
        {
            var notifications = await _notificationRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<NotificationReadDto>>(notifications);
        }

        public async Task<IEnumerable<NotificationReadDto>> GetByUtilisateurIdAsync(int utilisateurId, int page, int pageSize)
        {
            var notifications = await _notificationRepository.GetByUtilisateurIdAsync(utilisateurId, page, pageSize);
            return _mapper.Map<IEnumerable<NotificationReadDto>>(notifications);
        }

        public async Task<bool> MarquerCommeLuAsync(int id)
        {
            return await _notificationRepository.MarquerCommeLuAsync(id);
        }

        public async Task<bool> UpdateAsync(int id, NotificationCreateDto dto)
        {
            var existing = await _notificationRepository.GetByIdAsync(id);
            if (existing == null) return false;

            _mapper.Map(dto, existing);
            await _notificationRepository.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var notificationToDelete = await _notificationRepository.GetByIdAsync(id);
            if (notificationToDelete == null) return false;

            await _notificationRepository.DeleteAsync(notificationToDelete);
            _logger.LogInformation("Notification {Id} supprimée.", id);
            return true;
        }
    }
}
