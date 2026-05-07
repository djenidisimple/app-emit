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
    }
}