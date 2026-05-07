using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface INotificationService
    {
        Task EnvoyerNotificationAsync(int utilisateurId, string message);
        Task EnvoyerNotificationsBulkAsync(List<int> utilisateurIds, string message);
    }
}