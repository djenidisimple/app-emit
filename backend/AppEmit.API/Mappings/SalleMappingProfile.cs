using AutoMapper;
using AppEmit.API.DTOs.Salle;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

    public class SalleMappingProfile : Profile
    {
        public SalleMappingProfile()
        {
            CreateMap<Salle, SalleResponseDto>()
                .ForMember(dest => dest.CodeSalle, opt => opt.MapFrom(src => src.CodeSalle))
                .ForMember(dest => dest.Libelle, opt => opt.MapFrom(src => src.Libelle));
            CreateMap<Salle, SalleDetailsDto>();
            CreateMap<SalleCreateDto, Salle>();
            CreateMap<SalleUpdateDto, Salle>();
        }
    }
