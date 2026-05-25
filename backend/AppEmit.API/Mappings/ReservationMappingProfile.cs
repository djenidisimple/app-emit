using AutoMapper;
using AppEmit.API.DTOs.Reservation;
using AppEmit.API.Entities;

namespace AppEmit.API.Mappings
{
    public class ReservationMappingProfile : Profile
    {
        public ReservationMappingProfile()
        {
            CreateMap<Reservation, ReservationReadDto>()
                .ForMember(dest => dest.Titre, opt => opt.MapFrom(src => src.Evenement.Nom))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Evenement.Description ?? ""))
                .ForMember(dest => dest.DatePrecise, opt => opt.MapFrom(src => src.Evenement.DateEvenement))
                .ForMember(dest => dest.Session, opt => opt.MapFrom(src => src.Session ?? ""))
                .ForMember(dest => dest.DemandeurId, opt => opt.MapFrom(src => src.UtilisateurId))
                .ForMember(dest => dest.DemandeurNom, opt => opt.MapFrom(src => $"{src.Utilisateur.Nom} {src.Utilisateur.Prenom}"))
                .ForMember(dest => dest.SalleId, opt => opt.MapFrom(src => src.SalleId))
                .ForMember(dest => dest.SalleLibelle, opt => opt.MapFrom(src => src.Salle.Libelle));
        }
    }
}
