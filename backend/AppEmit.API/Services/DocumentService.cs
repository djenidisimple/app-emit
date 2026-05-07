using AppEmit.API.DTOs.Document;
using AppEmit.API.Interfaces;
using AppEmit.Entities;          // ← namespace de Brunel
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AppEmit.API.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly DbContext _context;

        public DocumentService(DbContext context)
        {
            _context = context;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<byte[]> ExporterPlanningPdfAsync(ExportRequestDto dto)
        {
            var seances = await _context.Set<SeanceCours>()
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .Where(s => s.DateDebutAnnee >= dto.DateDebut
                         && s.DateFinAnnee <= dto.DateFin)
                .ToListAsync();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    page.Header()
                        .Text("Planning EMIT")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        // En-têtes
                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten2)
                                .Padding(5).Text("Matière").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2)
                                .Padding(5).Text("Professeur").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2)
                                .Padding(5).Text("Salle").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2)
                                .Padding(5).Text("Date début").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2)
                                .Padding(5).Text("Terminée").Bold();
                        });

                        // Données
                        foreach (var s in seances)
                        {
                            table.Cell().Padding(5)
                                .Text(s.Matiere?.Nom ?? s.MatiereId.ToString());
                            table.Cell().Padding(5)
                                .Text($"{s.Professeur?.Nom} {s.Professeur?.Prenom}");
                            table.Cell().Padding(5)
                                .Text(s.Salle?.Libelle  ?? s.SalleId.ToString());
                            table.Cell().Padding(5)
                                .Text(s.DateDebutAnnee.ToString("dd/MM/yyyy"));
                            table.Cell().Padding(5)
                                .Text(s.EstTerminee ? "Oui" : "Non");
                        }
                    });

                    page.Footer().AlignCenter()
                        .Text($"Généré le {DateTime.Now:dd/MM/yyyy HH:mm}");
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> ExporterPlanningExcelAsync(ExportRequestDto dto)
        {
            var seances = await _context.Set<SeanceCours>()
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .Where(s => s.DateDebutAnnee >= dto.DateDebut
                         && s.DateFinAnnee <= dto.DateFin)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var feuille = workbook.Worksheets.Add("Planning");

            // En-têtes
            feuille.Cell(1, 1).Value = "Matière";
            feuille.Cell(1, 2).Value = "Professeur";
            feuille.Cell(1, 3).Value = "Salle";
            feuille.Cell(1, 4).Value = "Date Début";
            feuille.Cell(1, 5).Value = "Date Fin";
            feuille.Cell(1, 6).Value = "Terminée";

            // Style en-têtes
            var headerRange = feuille.Range(1, 1, 1, 6);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightBlue;

            // Données
            int ligne = 2;
            foreach (var s in seances)
            {
                feuille.Cell(ligne, 1).Value = s.Matiere?.Nom ?? s.MatiereId.ToString();
                feuille.Cell(ligne, 2).Value = $"{s.Professeur?.Nom} {s.Professeur?.Prenom}";
                feuille.Cell(ligne, 3).Value = s.Salle?.Libelle ?? s.SalleId.ToString();
                feuille.Cell(ligne, 4).Value = s.DateDebutAnnee.ToString("dd/MM/yyyy");
                feuille.Cell(ligne, 5).Value = s.DateFinAnnee.ToString("dd/MM/yyyy");
                feuille.Cell(ligne, 6).Value = s.EstTerminee ? "Oui" : "Non";
                ligne++;
            }

            feuille.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}