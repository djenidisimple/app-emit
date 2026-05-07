using AppEmit.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface IUtilisateurRepository
    {
        Task<Utilisateur?> GetProfesseurBySeanceAsync(int seanceCoursId);
        Task<List<Utilisateur>> GetEtudiantsBySeanceAsync(int seanceCoursId);
    }
}