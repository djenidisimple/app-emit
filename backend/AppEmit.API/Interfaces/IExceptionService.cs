using AppEmit.API.DTOs;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface IExceptionService
    {
        Task<ReponseExceptionDto> AnnulerCoursAsync(CreerExceptionDto dto);
        Task<ReponseExceptionDto> ReporterCoursAsync(CreerExceptionDto dto);
        Task<ReponseExceptionDto> RendreIndisponibleAsync(CreerExceptionDto dto); // pour salle ou prof
    }
}
