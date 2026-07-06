using AppEmit.API.DTOs.Document;

namespace AppEmit.API.Interfaces
{
    public interface IDocumentService
    {
        Task<byte[]> ExporterPlanningPdfAsync(ExportRequestDto dto);
        Task<byte[]> ExporterPlanningExcelAsync(ExportRequestDto dto);
        Task<byte[]> ExporterEmploiDuTempsPdfAsync(EmploiDuTempsExportDto dto);
        Task<byte[]> ExporterAvisEtudiantsPdfAsync(AvisEtudiantExportDto dto);
    }
}
