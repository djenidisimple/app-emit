using AutoMapper;
using AppEmit.API.DTOs.Examen;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings
{
    public class ExamenMappingProfile : Profile
    {
        public ExamenMappingProfile()
        {
            CreateMap<Examen, ExamenReadDto>()
                .ForMember(dest => dest.MatiereNom, opt => opt.MapFrom(src => src.Matiere.Nom))
                .ForMember(dest => dest.MatiereCode, opt => opt.MapFrom(src => src.Matiere.Code))
                .ForMember(dest => dest.ProfesseurNom, opt => opt.MapFrom(src => $"{src.Professeur.Prenom} {src.Professeur.Nom}"))
                .ForMember(dest => dest.SalleNom, opt => opt.MapFrom(src => src.Salle.Libelle ?? src.Salle.Nom))
                .ForMember(dest => dest.HeureDebut, opt => opt.MapFrom(src => src.HeureDebut.ToString(@"hh\:mm")))
                .ForMember(dest => dest.HeureFin, opt => opt.MapFrom(src => src.HeureFin.ToString(@"hh\:mm")));
        }
    }
}
