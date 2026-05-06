using AppEmit.API.DTOs;
using AppEmit.Entities;

namespace AppEmit.API.Mappers
{
    public static class PlanningMapper
    {
        public static SeancePlanningDto ToDto(SeanceCours seance, DateTime occurrenceDate, string statut, string? motif = null)
        {
            return new SeancePlanningDto
            {
                Id = seance.Id,
                MatiereNom = seance.Matiere?.Nom ?? string.Empty,
                MatiereCode = seance.Matiere?.Code ?? string.Empty,
                ProfesseurNomComplet = (seance.Professeur?.Prenom + " " + seance.Professeur?.Nom) ?? string.Empty,
                SalleNom = seance.Salle?.Libelle ?? string.Empty,
                Jour = seance.Creneau?.Jour ?? string.Empty,
                HeureDebut = seance.Creneau?.HeureDebut ?? TimeSpan.Zero,
                HeureFin = seance.Creneau?.HeureFin ?? TimeSpan.Zero,
                DateOccurrence = occurrenceDate,
                Statut = statut,
                MotifException = motif
            };
        }
    }
}