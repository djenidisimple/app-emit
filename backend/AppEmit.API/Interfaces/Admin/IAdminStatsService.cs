// Interfaces/Admin/IAdminStatsService.cs
using AppEmit.API.DTOs.Admin;

namespace AppEmit.API.Interfaces.Admin;

public interface IAdminStatsService
{
    Task<StatAdminDto> GetStatistiquesAsync();
}