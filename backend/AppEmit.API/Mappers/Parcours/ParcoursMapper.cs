using AppEmit.DTOs.Parcours;
using AppEmit.Entities;

namespace AppEmit.Mappers;

public static class ParcoursMapper
{
    public static ParcoursDto ToDto(Parcours p)
    {
        return new ParcoursDto
        {
            Id = p.Id,
            Nom = p.Nom,
            FiliereId = p.FiliereId,
            FiliereNom = p.Filiere?.Nom ?? string.Empty
        };
    }

    public static Parcours ToEntity(ParcoursCreateDto dto)
    {
        return new Parcours { Nom = dto.Nom, FiliereId = dto.FiliereId };
    }

    public static void UpdateEntity(Parcours entity, ParcoursCreateDto dto)
    {
        entity.Nom = dto.Nom;
        entity.FiliereId = dto.FiliereId;
    }
}