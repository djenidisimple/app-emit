using AppEmit.Entities;

namespace AppEmit.Interfaces;

public interface IParcoursRepository : IGenericRepository<Parcours>
{
    Task<bool> ExistsByNameInFiliereAsync(string nom, int filiereId);
}