using AppEmit.API.DTOs.Utilisateur;

namespace AppEmit.API.Interfaces
{
    public interface IUtilisateurService
    {
        Task<IEnumerable<UtilisateurDto>> GetAllAsync();
        Task<IEnumerable<UtilisateurDto>> GetByRoleAsync(string role);
        Task<UtilisateurDto?> GetByIdAsync(int id);
        Task<UtilisateurDto> CreateAsync(UtilisateurCreateDto dto);
        Task<UtilisateurDto?> UpdateAsync(int id, UtilisateurUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
