using AutoMapper;
using AppEmit.API.DTOs.Salle;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

    public class SalleMappingProfile : Profile
    {
        public SalleMappingProfile()
        {
            CreateMap<Salle, SalleResponseDto>();
            CreateMap<Salle, SalleDetailsDto>();
            CreateMap<SalleCreateDto, Salle>();
            CreateMap<SalleUpdateDto, Salle>();
        }
    }
