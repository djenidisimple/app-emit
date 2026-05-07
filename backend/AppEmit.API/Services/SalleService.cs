using AppEmit.Entities;
using AppEmit.Interfaces;

namespace AppEmit.Services
{
    public class SalleService : ISalleService
    {
        private readonly ISalleRepository _salleRepository;

        public SalleService(ISalleRepository salleRepository)
        {
            _salleRepository = salleRepository;
        }

        public async Task<IEnumerable<Salle>> ObtenirToutesLesSallesAsync()
        {
            return await _salleRepository.GetAllAsync();
        }

        public async Task<Salle?> ObtenirSalleParIdAsync(int id)
        {
            return await _salleRepository.GetByIdAsync(id);
        }

        public async Task<Salle> CreerSalleAsync(Salle salle)
        {
            // Logique métier : On s'assure que la salle est active par défaut
            salle.EstActive = true;
            
            await _salleRepository.AddAsync(salle);
            await _salleRepository.SaveChangesAsync();
            return salle;
        }

        public async Task<bool> ModifierSalleAsync(int id, Salle salle)
        {
            var existingSalle = await _salleRepository.GetByIdAsync(id);
            if (existingSalle == null) return false;

            // Mise à jour des propriétés
            existingSalle.CodeSalle = salle.CodeSalle;
            existingSalle.Libelle = salle.Libelle;
            existingSalle.Capacite = salle.Capacite;
            existingSalle.Equipements = salle.Equipements;
            existingSalle.EstActive = salle.EstActive;

            _salleRepository.Update(existingSalle);
            return await _salleRepository.SaveChangesAsync();
        }

        public async Task<bool> SupprimerSalleAsync(int id)
        {
            var salle = await _salleRepository.GetByIdAsync(id);
            if (salle == null) return false;

            _salleRepository.Delete(salle);
            return await _salleRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<Salle>> ObtenirSallesDisponiblesAsync()
        {
            // Utilise la méthode spécifique que nous avons créée dans le Repository
            return await _salleRepository.GetSallesActivesAsync();
        }
    }
}