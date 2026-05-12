using AutoMapper;
using AppEmit.API.DTOs;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings;

public class PlanningMappingProfile : Profile
{
    public PlanningMappingProfile()
    {
        CreateMap<SeanceCours, SeancePlanningDto>()
            .ForMember(dest => dest.HeureDebut, opt => opt.MapFrom(src => src.Creneau != null ? src.Creneau.HeureDebut : TimeSpan.Zero))
            .ForMember(dest => dest.HeureFin, opt => opt.MapFrom(src => src.Creneau != null ? src.Creneau.HeureFin : TimeSpan.Zero))
            .ForMember(dest => dest.MatiereNom, opt => opt.MapFrom(src => src.Matiere != null ? src.Matiere.Nom : string.Empty))
            .ForMember(dest => dest.SalleNom, opt => opt.MapFrom(src => src.Salle != null ? src.Salle.Libelle : string.Empty))
            .ForMember(dest => dest.ProfesseurNomComplet, opt => opt.MapFrom(src => src.Professeur != null ? $"{src.Professeur.Nom} {src.Professeur.Prenom}" : string.Empty));
    }
}
