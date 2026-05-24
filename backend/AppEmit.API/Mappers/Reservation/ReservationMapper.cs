using AppEmit.DTOs.Reservation;
using AppEmit.Entities;

namespace AppEmit.Mappers;

public static class ReservationMapper
{
    public static ReservationDto ToDto(EvenementReservation reservation)
    {
        return new ReservationDto
        {
            Id = reservation.Id,
            Titre = reservation.Titre,
            Type = reservation.Type,
            DatePrecise = reservation.DatePrecise,
            Session = reservation.Session,
            Statut = reservation.Statut,
            DemandeurId = reservation.DemandeurId,
            DemandeurNom = reservation.Demandeur?.Nom ?? string.Empty,
            DemandeurPrenom = reservation.Demandeur?.Prenom ?? string.Empty,
            SalleId = reservation.SalleId,
            SalleLibelle = reservation.Salle?.Libelle ?? string.Empty
        };
    }

    public static EvenementReservation ToEntity(int demandeurId, ReservationCreateDto dto)
    {
        return new EvenementReservation
        {
            Titre = dto.Titre,
            Type = "Club",  // Forcé pour les réservations clubs
            DatePrecise = dto.DatePrecise,
            Session = dto.Session,
            Statut = "En attente", // On met en attente par defaut une reservation fait jusqu'à la reponse du Responsable   
            DemandeurId = demandeurId,
            SalleId = dto.SalleId
        };
    }
}