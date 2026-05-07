using AppEmit.Entities;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface ISalleRepository
    {
        Task<Salle?> GetByIdAsync(int id);
    }
}