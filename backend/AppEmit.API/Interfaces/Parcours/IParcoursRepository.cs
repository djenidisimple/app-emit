using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces;

public interface IParcoursRepository : IGenericRepository<Parcours>
{
    Task<bool> ExistsByNameInFiliereAsync(string nom, int filiereId);
}
