using AppEmit.DTOs.Matiere;
using AppEmit.Entities;

namespace AppEmit.Mappers;

public static class MatiereMapper
{
    public static MatiereDto ToDto(Matiere m)
    {
        return new MatiereDto { Id = m.Id, Code = m.Code, Nom = m.Nom };
    }

    public static Matiere ToEntity(MatiereCreateDto dto)
    {
        return new Matiere { Code = dto.Code, Nom = dto.Nom };
    }

    public static void UpdateEntity(Matiere entity, MatiereCreateDto dto)
    {
        entity.Code = dto.Code;
        entity.Nom = dto.Nom;
    }
}