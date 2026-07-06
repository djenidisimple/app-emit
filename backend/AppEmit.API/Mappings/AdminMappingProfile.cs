using AutoMapper;
using AppEmit.API.DTOs.Utilisateur;
using AppEmit.API.DTOs.Niveau;
using AppEmit.API.DTOs.Filiere;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings
{
    public class AdminMappingProfile : Profile
    {
        public AdminMappingProfile()
        {
            CreateMap<Utilisateur, UtilisateurDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src =>
                    src.Roles != null && src.Roles.Any() ? src.Roles.First().Nom : src.Role))
                .ForMember(dest => dest.NiveauCode, opt => opt.MapFrom(src =>
                    src.Niveau != null ? src.Niveau.Code : null));

            CreateMap<UtilisateurCreateDto, Utilisateur>();
            CreateMap<UtilisateurUpdateDto, Utilisateur>()
                .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

            CreateMap<Niveau, NiveauDto>()
                .ForMember(dest => dest.ParcoursNom, opt => opt.MapFrom(src =>
                    src.Parcours != null ? src.Parcours.Nom : null));
            CreateMap<NiveauCreateDto, Niveau>();

            CreateMap<Filiere, FiliereDto>();
            CreateMap<FiliereCreateDto, Filiere>();
        }
    }
}
