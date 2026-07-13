using AppEmit.API.DTOs.Document;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppEmit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Nécessite un token JWT valide
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        /// <summary>Exporter le planning en PDF</summary>
        [HttpPost("export/pdf")]
        public async Task<IActionResult> ExporterPdf([FromBody] ExportRequestDto dto)
        {
            var bytes = await _documentService.ExporterPlanningPdfAsync(dto);
            return File(bytes, "application/pdf", 
                $"planning_{dto.DateDebut:yyyyMMdd}_{dto.DateFin:yyyyMMdd}.pdf");
        }

        /// <summary>Exporter le planning en Excel</summary>
        [HttpPost("export/excel")]
        public async Task<IActionResult> ExporterExcel([FromBody] ExportRequestDto dto)
        {
            var bytes = await _documentService.ExporterPlanningExcelAsync(dto);
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"planning_{dto.DateDebut:yyyyMMdd}_{dto.DateFin:yyyyMMdd}.xlsx");
        }

        /// <summary>Exporter l'emploi du temps en PDF (grille colorée)</summary>
        [HttpPost("export/emploi-du-temps")]
        public async Task<IActionResult> ExporterEmploiDuTemps([FromBody] EmploiDuTempsExportDto dto)
        {
            var bytes = await _documentService.ExporterEmploiDuTempsPdfAsync(dto);
            return File(bytes, "application/pdf",
                $"emploi_du_temps_{dto.SalleCode ?? "global"}_{DateTime.Now:yyyyMMdd}.pdf");
        }

        /// <summary>Exporter l'emploi du temps en Excel (grille)</summary>
        [HttpPost("export/emploi-du-temps/excel")]
        public async Task<IActionResult> ExporterEmploiDuTempsExcel([FromBody] EmploiDuTempsExportDto dto)
        {
            var bytes = await _documentService.ExporterEmploiDuTempsExcelAsync(dto);
            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"emploi_du_temps_{dto.SalleCode ?? "global"}_{DateTime.Now:yyyyMMdd}.xlsx");
        }

        /// <summary>Exporter l'emploi du temps des examens</summary>
        [HttpPost("export/examens")]
        public async Task<IActionResult> ExporterExamens([FromBody] EmploiDuTempsExportDto dto)
        {
            var bytes = await _documentService.ExporterExamenTimetablePdfAsync(dto);
            return File(bytes, "application/pdf",
                $"examens_{DateTime.Now:yyyyMMdd}.pdf");
        }

        /// <summary>Exporter une confirmation de réservation</summary>
        [HttpGet("export/reservation/{id}")]
        public async Task<IActionResult> ExporterReservation(int id)
        {
            var bytes = await _documentService.ExporterReservationPdfAsync(id);
            return File(bytes, "application/pdf",
                $"reservation_{id}_{DateTime.Now:yyyyMMdd}.pdf");
        }

        /// <summary>Exporter la liste des réservations en PDF (format académique)</summary>
        [HttpPost("export/reservations")]
        public async Task<IActionResult> ExporterListeReservations([FromBody] ReservationListExportDto dto)
        {
            var bytes = await _documentService.ExporterListeReservationsPdfAsync(dto);
            return File(bytes, "application/pdf",
                $"reservations_{DateTime.Now:yyyyMMdd_HHmm}.pdf");
        }

        /// <summary>Exporter l'avis aux étudiants (examens)</summary>
        [HttpPost("export/avis-etudiants")]
        public async Task<IActionResult> ExporterAvisEtudiants([FromBody] AvisEtudiantExportDto dto)
        {
            var bytes = await _documentService.ExporterAvisEtudiantsPdfAsync(dto);
            return File(bytes, "application/pdf",
                $"avis_etudiants_{DateTime.Now:yyyyMMdd}.pdf");
        }
    }
}
