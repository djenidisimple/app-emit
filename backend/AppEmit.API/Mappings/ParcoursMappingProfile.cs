using AutoMapper;
using AppEmit.API.DTOs.Parcours;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

public class ParcoursMappingProfile : Profile
{
    public ParcoursMappingProfile()
    {
        CreateMap<Parcours, ParcoursDto>();
        CreateMap<ParcoursCreateDto, Parcours>();
    }
}
