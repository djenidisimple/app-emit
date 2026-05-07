using AppEmit.Entities;

namespace AppEmit.Interfaces;

public interface IMatiereRepository : IGenericRepository<Matiere>
{
    Task<bool> ExistsByCodeAsync(string code);
}