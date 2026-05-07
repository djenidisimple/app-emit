using AppEmit.Entities;
using AppEmit.DTOs;

namespace AppEmit.Mappers
{
    public static class SalleMapper
    {
        public static SalleDto ToSalleDto(this Salle salleModel)
        {
            return new SalleDto
            {
                Id = salleModel.Id,
                CodeSalle = salleModel.CodeSalle,
                Libelle = salleModel.Libelle,
                Capacite = salleModel.Capacite,
                Equipements = salleModel.Equipements,
                EstActive = salleModel.EstActive
            };
        }

        public static Salle ToSalleFromCreate(this SalleCreateDto salleDto)
        {
            return new Salle
            {
                CodeSalle = salleDto.CodeSalle,
                Libelle = salleDto.Libelle,
                Capacite = salleDto.Capacite,
                Equipements = salleDto.Equipements,
                EstActive = true // Valeur par défaut
            };
        }
    }
}