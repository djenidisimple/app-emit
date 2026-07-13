using AutoMapper;
using AppEmit.API.DTOs.Matiere;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

public class MatiereMappingProfile : Profile
{
    public MatiereMappingProfile()
    {
        CreateMap<Matiere, MatiereDto>()
            .ForMember(d => d.NiveauCode, o => o.MapFrom(s => s.Niveau != null ? s.Niveau.Code : null));
        CreateMap<MatiereCreateDto, Matiere>();
    }
}
