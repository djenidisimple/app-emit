using AppEmit.API.Entities;

namespace AppEmit.API.Interfaces;

public interface IMatiereRepository : IGenericRepository<Matiere>
{
    Task<bool> ExistsByCodeAsync(string code);
}
