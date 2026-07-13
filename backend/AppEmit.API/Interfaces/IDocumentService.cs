using AppEmit.API.DTOs.Document;

namespace AppEmit.API.Interfaces
{
    public interface IDocumentService
    {
        Task<byte[]> ExporterPlanningPdfAsync(ExportRequestDto dto);
        Task<byte[]> ExporterPlanningExcelAsync(ExportRequestDto dto);
        Task<byte[]> ExporterEmploiDuTempsPdfAsync(EmploiDuTempsExportDto dto);
        Task<byte[]> ExporterEmploiDuTempsExcelAsync(EmploiDuTempsExportDto dto);
        Task<byte[]> ExporterExamenTimetablePdfAsync(EmploiDuTempsExportDto dto);
        Task<byte[]> ExporterReservationPdfAsync(int reservationId);
        Task<byte[]> ExporterAvisEtudiantsPdfAsync(AvisEtudiantExportDto dto);
        Task<byte[]> ExporterListeReservationsPdfAsync(ReservationListExportDto dto);
    }
}
