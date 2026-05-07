using AppEmit.Entities;

namespace AppEmit.Interfaces
{
    public interface ISalleService
    {
        Task<IEnumerable<Salle>> ObtenirToutesLesSallesAsync();
        Task<Salle?> ObtenirSalleParIdAsync(int id);
        Task<Salle> CreerSalleAsync(Salle salle);
        Task<bool> ModifierSalleAsync(int id, Salle salle);
        Task<bool> SupprimerSalleAsync(int id);
        Task<IEnumerable<Salle>> ObtenirSallesDisponiblesAsync();
    }
}