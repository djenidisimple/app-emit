using AppEmit.API.DTOs.DemandeEchange;

namespace AppEmit.API.Interfaces
{
    public interface IDemandeEchangeService
    {
        Task<DemandeEchangeReadDto> CreerDemande(DemandeEchangeCreateDto dto);
        Task<List<DemandeEchangeReadDto>> ObtenirDemandes(int professeurId);
        Task<DemandeEchangeReadDto> AccepterDemande(int id);
        Task<DemandeEchangeReadDto> RefuserDemande(int id);
    }
}