using AppEmit.API.DTOs;
using System.Threading.Tasks;

namespace AppEmit.API.Interfaces
{
    public interface IPlanningHebdoService
    {
        Task<PlanningHebdoResponseDto> GetPlanningHebdomadaireAsync(PlanningHebdoRequestDto request);
    }
}