using AutoMapper;
using AppEmit.API.DTOs.Matiere;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

public class MatiereMappingProfile : Profile
{
    public MatiereMappingProfile()
    {
        CreateMap<Matiere, MatiereDto>();
        CreateMap<MatiereCreateDto, Matiere>();
    }
}
