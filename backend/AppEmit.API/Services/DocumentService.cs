using AppEmit.API.DTOs.Document;
using AppEmit.API.Interfaces;
using AppEmit.API.Entities;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using AppEmit.API.Data;
using System.Linq;

namespace AppEmit.API.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly AppDbContext _context;

        public DocumentService(AppDbContext context)
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
                .Where(s => s.DateDebutAnnee <= dto.DateFin
                         && s.DateFinAnnee >= dto.DateDebut)
                .Where(s => !dto.ProfesseurId.HasValue || s.ProfesseurId == dto.ProfesseurId.Value)
                .Where(s => !dto.SalleId.HasValue || s.SalleId == dto.SalleId.Value)
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
                .Where(s => s.DateDebutAnnee <= dto.DateFin
                         && s.DateFinAnnee >= dto.DateDebut)
                .Where(s => !dto.ProfesseurId.HasValue || s.ProfesseurId == dto.ProfesseurId.Value)
                .Where(s => !dto.SalleId.HasValue || s.SalleId == dto.SalleId.Value)
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

        public async Task<byte[]> ExporterEmploiDuTempsPdfAsync(EmploiDuTempsExportDto dto)
        {
            var query = _context.Set<SeanceCours>()
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .AsQueryable();

            if (dto.SalleId.HasValue)
                query = query.Where(s => s.SalleId == dto.SalleId.Value);

            if (dto.NiveauId.HasValue)
                query = query.Where(s => s.NiveauId == dto.NiveauId.Value);

            if (dto.ParcoursId.HasValue)
                query = query.Where(s => s.ParcoursId == dto.ParcoursId.Value);

            var seances = await query.ToListAsync();

            var jours = new[] { "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" };
            var plagesHoraires = new[]
            {
                new TimeSpan(7, 0, 0),
                new TimeSpan(8, 0, 0),
                new TimeSpan(9, 0, 0),
                new TimeSpan(10, 0, 0),
                new TimeSpan(11, 0, 0),
                new TimeSpan(12, 0, 0),
                new TimeSpan(13, 0, 0),
                new TimeSpan(14, 0, 0),
                new TimeSpan(15, 0, 0),
                new TimeSpan(16, 0, 0),
                new TimeSpan(17, 0, 0)
            };

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);

                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item().Text("ANNEE UNIVERSITAIRE : " + dto.AnneeUniversitaire).Bold().FontSize(10);
                                left.Item().Text($"MENTION : {dto.Mention ?? "INFORMATIQUE"}").Bold().FontSize(9);
                                left.Item().Text($"PARCOURS : {dto.ParcoursNom ?? "TRONC COMMUN"}").Bold().FontSize(9);
                                left.Item().Text($"NIVEAU : {dto.NiveauCode ?? "L3"}").Bold().FontSize(9);
                            });

                            row.RelativeItem().AlignRight().Width(100).Background(Colors.Blue.Medium)
                                .Padding(5).Text($"SALLE  {dto.SalleCode ?? "B 303"}")
                                .FontColor(Colors.White).Bold().FontSize(10);
                        });

                        col.Item().PaddingTop(10).AlignCenter()
                            .Text("EMPLOI DU TEMPS").Bold().FontSize(16);
                    });

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(80);
                            foreach (var _ in jours)
                                columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("HORAIRES").Bold().FontSize(8);
                            foreach (var jour in jours)
                            {
                                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).AlignCenter()
                                    .Text(jour.ToUpper()).Bold().FontSize(8);
                            }
                        });

                        foreach (var plage in plagesHoraires)
                        {
                            var heureFin = plage.Add(new TimeSpan(1, 0, 0));
                            var plageText = $"{plage.Hours:D2}h00- {heureFin.Hours:D2}h00";

                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1)
                                .Padding(2).Text(plageText).FontSize(7);

                            foreach (var jour in jours)
                            {
                                var seanceCell = seances.FirstOrDefault(s =>
                                    s.Creneau != null && s.Creneau.Jour == jour && s.Creneau.HeureDebut == plage);

                                var cell = table.Cell().BorderLeft(0.5f).BorderColor(Colors.Grey.Lighten1)
                                    .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1)
                                    .Padding(2);

                                if (seanceCell != null)
                                {
                                    var color = HexToColor(seanceCell.CouleurAffichage ?? "#FF0000");
                                    cell.Background(color).AlignCenter().Column(col =>
                                    {
                                        col.Item().PaddingTop(2).Text(seanceCell.Matiere?.Nom ?? "").Bold().FontSize(7).FontColor(Colors.White);
                                        col.Item().Text($"{seanceCell.Professeur?.Nom} {seanceCell.Professeur?.Prenom}").FontSize(6).FontColor(Colors.White);
                                    });
                                }
                            }
                        }
                    });

                    page.Footer().AlignCenter().PaddingTop(20)
                        .Text("UNIVERSITÉ DE FIANARANTSOA\nÉcole de Management et d'Innovation Technologique (EMIT)")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> ExporterAvisEtudiantsPdfAsync(AvisEtudiantExportDto dto)
        {
            var query = _context.Set<SeanceCours>()
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Creneau)
                .AsQueryable();

            if (dto.NiveauId.HasValue)
                query = query.Where(s => s.NiveauId == dto.NiveauId.Value);

            if (dto.FiliereId.HasValue)
                query = query.Where(s => s.Niveau != null && s.Niveau.Parcours != null && s.Niveau.Parcours.FiliereId == dto.FiliereId.Value);

            if (dto.SeanceIds != null && dto.SeanceIds.Any())
                query = query.Where(s => dto.SeanceIds.Contains(s.Id));

            if (dto.DateDebut.HasValue)
                query = query.Where(s => s.DateDebutAnnee >= dto.DateDebut.Value);

            if (dto.DateFin.HasValue)
                query = query.Where(s => s.DateFinAnnee <= dto.DateFin.Value);

            var seances = await query.OrderByDescending(s => s.Creneau.HeureDebut).ToListAsync();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item().Text("UNIVERSITÉ DE FIANARANTSOA").Bold().FontSize(9);
                                left.Item().Text("ÉCOLE DE MANAGEMENT ET D'INNOVATION TECHNOLOGIQUE").Bold().FontSize(8);
                                left.Item().Text("E.M.I.T.").Bold().FontSize(8);
                                left.Item().Text("site web : www.emit.mg").FontSize(7);
                            });

                            row.RelativeItem().AlignRight().Width(80).Text("eMIT")
                                .FontSize(20).Bold().FontColor(Colors.Blue.Medium);
                        });

                        col.Item().PaddingTop(10).AlignCenter()
                            .Text($"ANNÉE UNIVERSITAIRE {dto.AnneeUniversitaire} - {dto.AnneeUniversitaire.Split('-')[1]}")
                            .Bold().FontSize(10);

                        col.Item().PaddingTop(10).AlignCenter()
                            .Text($"AVIS AUX ETUDIANTS {dto.Mention ?? "INFO"}")
                            .Bold().FontSize(14);

                        col.Item().PaddingTop(5).AlignCenter()
                            .Text("EXAMEN :").Bold().FontSize(12);
                    });

                    page.Content().PaddingTop(20).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(40);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.ConstantColumn(60);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("DATE").Bold().FontSize(8);
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("HEURE").Bold().FontSize(8);
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("EC").Bold().FontSize(8);
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("ENSEIGNANT").Bold().FontSize(8);
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("SESSION").Bold().FontSize(8);
                        });

                        foreach (var s in seances)
                        {
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(5)
                                .Text(s.DateDebutAnnee.ToString("dddd dd MMMM yyyy")).FontSize(8);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(5)
                                .Text($"{s.Creneau?.HeureDebut.Hours:D2}h").FontSize(8);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(5)
                                .Text(s.Matiere?.Nom ?? "").FontSize(8);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(5)
                                .Text($"Dr {s.Professeur?.Nom} {s.Professeur?.Prenom}").FontSize(8);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(5)
                                .Text("Normale").FontSize(8);
                        }
                    });

                    page.Footer().Column(col =>
                    {
                        col.Item().PaddingTop(30).Text("NB : - L'appel se fera une demi-heure avant le début de l'épreuve.").FontSize(7);
                        col.Item().Text("- Se munir de la CIN, de la Carte d'étudiant et de l'attestation d'inscription pendant toutes les épreuves.").FontSize(7);
                        col.Item().Text("- Le retard de plus de 15 mn est inadmissible.").FontSize(7);
                        col.Item().Text("- Veuillez respecter les consignes vestimentaires et coupe de cheveux.").FontSize(7);

                        col.Item().PaddingTop(20).AlignRight().Text($"Fait à Fianarantsoa, le {DateTime.Now:dd MMMM yyyy}").FontSize(7);
                        col.Item().AlignRight().Text("Le chef de service de la Scolarité").FontSize(7).Bold();
                        col.Item().AlignRight().Text("RAKOTOARISOA Rindra Helisoa Bakoliniaina").FontSize(7);
                    });
                });
            });

            return document.GeneratePdf();
        }

        private static Color HexToColor(string hex)
        {
            hex = hex.Replace("#", "");
            if (hex.Length == 6)
            {
                var r = Convert.ToByte(hex.Substring(0, 2), 16);
                var g = Convert.ToByte(hex.Substring(2, 2), 16);
                var b = Convert.ToByte(hex.Substring(4, 2), 16);
                return Color.FromRGB(r, g, b);
            }
            return Color.FromHex(hex);
        }
    }
}
