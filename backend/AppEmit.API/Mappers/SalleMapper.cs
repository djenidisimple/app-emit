using AppEmit.DTOs.Salle;
using AppEmit.Entities;

namespace AppEmit.Mappers;

public static class SalleMapper
{
    public static SalleDto ToDto(Salle salle)
    {
        return new SalleDto
        {
            Id = salle.Id,
            CodeSalle = salle.CodeSalle,
            Libelle = salle.Libelle,
            Capacite = salle.Capacite,
            Equipements = salle.Equipements,
            EstActive = salle.EstActive
        };
    }

    public static Salle ToEntity(SalleCreateDto dto)
    {
        return new Salle
        {
            CodeSalle = dto.CodeSalle,
            Libelle = dto.Libelle,
            Capacite = dto.Capacite,
            Equipements = dto.Equipements,
            EstActive = dto.EstActive
        };
    }

    public static void UpdateEntity(Salle entity, SalleCreateDto dto)
    {
        entity.CodeSalle = dto.CodeSalle;
        entity.Libelle = dto.Libelle;
        entity.Capacite = dto.Capacite;
        entity.Equipements = dto.Equipements;
        entity.EstActive = dto.EstActive;
    }
}