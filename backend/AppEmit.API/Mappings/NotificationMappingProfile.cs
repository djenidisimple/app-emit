using AutoMapper;
using AppEmit.API.DTOs.Notification;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

public class NotificationMappingProfile : Profile
{
    public NotificationMappingProfile()
    {
        CreateMap<Notification, NotificationReadDto>();

        CreateMap<NotificationCreateDto, Notification>()
            .ForMember(dest => dest.DateEnvoi, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.EstLu, opt => opt.MapFrom(_ => false));
    }
}
