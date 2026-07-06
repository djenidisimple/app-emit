using AppEmit.API.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface IUtilisateurRepository : IGenericRepository<Utilisateur>
    {
        Task<Utilisateur?> GetProfesseurBySeanceAsync(int seanceCoursId);
        Task<List<Utilisateur>> GetEtudiantsBySeanceAsync(int seanceCoursId);
        Task<IEnumerable<Utilisateur>> GetByRoleAsync(string role);
        Task<Utilisateur?> GetUserWithRolesAndPermissionsAsync(string emailNormalise);
    }
}
