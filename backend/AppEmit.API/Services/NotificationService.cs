using AppEmit.API.DTOs.Notification;
using AppEmit.API.Entities;
using AppEmit.API.Hubs;
using AppEmit.API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationService> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(
            INotificationRepository repo,
            IMapper mapper,
            ILogger<NotificationService> logger,
            IHubContext<NotificationHub> hubContext)
        {
            _repo = repo;
            _mapper = mapper;
            _logger = logger;
            _hubContext = hubContext;
        }

        // ======================================================
        // GET NOTIFICATIONS (PAGINATION)
        // ======================================================
        public async Task<IEnumerable<NotificationReadDto>> GetNotificationsUtilisateurAsync(
            int utilisateurId,
            int page,
            int pageSize)
        {
            var notifications = await _repo.GetByUtilisateurIdAsync(utilisateurId, page, pageSize);
            return _mapper.Map<IEnumerable<NotificationReadDto>>(notifications);
        }

        // ======================================================
        // GET BY ID
        // ======================================================
        public async Task<NotificationReadDto?> GetByIdAsync(int id)
        {
            var notification = await _repo.GetByIdAsync(id);
            return notification is null
                ? null
                : _mapper.Map<NotificationReadDto>(notification);
        }

        // ======================================================
        // CREATE NOTIFICATION + SIGNALR
        // ======================================================
        public async Task<NotificationReadDto> CreateNotificationAsync(NotificationCreateDto dto)
        {
            var entity = _mapper.Map<Notification>(dto);

            entity.DateEnvoi = DateTime.UtcNow;
            entity.EstLu = false;

            var created = await _repo.CreateAsync(entity);
            var result = _mapper.Map<NotificationReadDto>(created);

            // REAL-TIME NOTIFICATION
            await _hubContext.Clients
                .Group($"user_{dto.UtilisateurId}")
                .SendAsync("NouvelleNotification", result);

            _logger.LogInformation(
                "Notification envoyée à l'utilisateur {UserId}",
                dto.UtilisateurId
            );

            return result;
        }

        // ======================================================
        // MARK AS READ
        // ======================================================
        public async Task<bool> MarquerCommeLuAsync(int id)
        {
            return await _repo.MarquerCommeLuAsync(id);
        }

        // ======================================================
        // DELETE
        // ======================================================
        public async Task<bool> DeleteNotificationAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }

        // ======================================================
        // COUNT UNREAD
        // ======================================================
        public async Task<int> GetCountNonLuesAsync(int utilisateurId)
        {
            return await _repo.CountNonLuesAsync(utilisateurId);
        }
    }
}