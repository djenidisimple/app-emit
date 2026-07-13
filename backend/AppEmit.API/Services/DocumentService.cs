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

            if (dto.ProfesseurId.HasValue)
                query = query.Where(s => s.ProfesseurId == dto.ProfesseurId.Value);

            if (dto.UtilisateurId.HasValue)
                query = query.Where(s => s.ProfesseurId == dto.UtilisateurId.Value);

            var seances = await query.ToListAsync();

            // Fetch missing info
            string mention = dto.Mention ?? "INFORMATIQUE";
            string parcoursNom = dto.ParcoursNom ?? "TRONC COMMUN";
            string niveauCode = dto.NiveauCode ?? "L3";
            string salleCode = dto.SalleCode ?? "B 303";

            if (dto.ParcoursId.HasValue)
            {
                var p = await _context.Set<Parcours>().FirstOrDefaultAsync(x => x.Id == dto.ParcoursId.Value);
                parcoursNom = p?.Nom ?? "TRONC COMMUN";
            }

            if (dto.NiveauId.HasValue)
            {
                var n = await _context.Set<Niveau>().FirstOrDefaultAsync(x => x.Id == dto.NiveauId.Value);
                niveauCode = n?.Code ?? "L3";
            }

            if (dto.SalleId.HasValue)
            {
                var s = await _context.Set<Salle>().FirstOrDefaultAsync(x => x.Id == dto.SalleId.Value);
                salleCode = s?.Libelle ?? "B 303";
            }

            var jours = new[] { "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi" };
            var startHour = 7;
            var endHour = 18;
            var totalHours = endHour - startHour;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1f, Unit.Centimetre);

                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(left =>
                            {
                                left.Item().Text("MENTION : " + mention.ToUpper()).Bold().FontSize(9);
                                left.Item().Text($"PARCOURS : {parcoursNom.ToUpper()}").Bold().FontSize(9);
                                left.Item().Text($"NIVEAU : {niveauCode.ToUpper()}").Bold().FontSize(9);
                            });

                            row.RelativeItem().AlignCenter().Text($"ANNEE UNIVERSITAIRE : {dto.AnneeUniversitaire.ToUpper()}").FontSize(10);

                            row.RelativeItem().AlignRight().Width(120).Background(Colors.Blue.Medium)
                                .Padding(5).Text($"SALLE {salleCode.ToUpper()}")
                                .FontColor(Colors.White).Bold().FontSize(10).AlignCenter();
                        });

                        col.Item().PaddingTop(15).AlignCenter()
                            .Text("EMPLOI DU TEMPS").Bold().FontSize(16);
                    });

                    page.Content().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(80);
                            foreach (var _ in jours)
                                columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Border(0.5f).BorderColor(Colors.Grey.Darken1).Background(Colors.White).Padding(5).AlignCenter().Text("HORAIRES").Bold().FontSize(9);
                            foreach (var jour in jours)
                            {
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Darken1).Background(Colors.White).Padding(5).AlignCenter().Text(jour.ToUpper()).Bold().FontSize(9);
                            }
                        });

                        // Tracking covered cells for RowSpan
                        var covered = new bool[totalHours, jours.Length];

                        for (int h = 0; h < totalHours; h++)
                        {
                            var currentHour = startHour + h;
                            var hourText = $"{currentHour:D2}h00 - {(currentHour + 1):D2}h00";

                            // Time column
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Darken1).Padding(5).AlignCenter().Text(hourText).FontSize(8);

                            for (int d = 0; d < jours.Length; d++)
                            {
                                if (covered[h, d])
                                {
                                    continue;
                                }

                                var jourNom = jours[d];
                                // Find a seance that starts at this hour and day
                                var seance = seances.FirstOrDefault(s => 
                                    s.Creneau != null && s.Creneau.Jour == jourNom && 
                                    s.Creneau.HeureDebut.Hours == currentHour && s.Creneau.HeureDebut.Minutes == 0);

                                if (seance != null)
                                {
                                    // Calculate duration
                                    var duration = 1;
                                    if (seance.Creneau != null)
                                    {
                                        duration = seance.Creneau.HeureFin.Hours - seance.Creneau.HeureDebut.Hours;
                                    }
                                    
                                    // Avoid exceeding table bounds
                                    duration = Math.Min(duration, totalHours - h);

                                    // Mark cells as covered
                                    for (int i = 1; i < duration; i++)
                                    {
                                        if (h + i < totalHours) covered[h + i, d] = true;
                                    }

                                    var color = HexToColor(seance.CouleurAffichage ?? "#4F5EFF");
                                    table.Cell().RowSpan((uint)duration).Border(0.5f).BorderColor(Colors.Grey.Darken1)
                                        .Background(color).AlignCenter().Padding(5).Column(colInner =>
                                        {
                                            colInner.Item().Text(seance.Matiere?.Nom ?? "").Bold().FontSize(8).FontColor(Colors.White);
                                            colInner.Item().Text($"{seance.Professeur?.Nom} {seance.Professeur?.Prenom}").FontSize(7).FontColor(Colors.White);
                                        });
                                }
                                else
                                {
                                    // Lunch break
                                    if (currentHour == 12)
                                    {
                                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Darken1).Background(Colors.Grey.Lighten3).AlignCenter().Text("PAUSE DÉJEUNER").FontSize(7).Italic();
                                    }
                                    else
                                    {
                                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Darken1);
                                    }
                                }
                            }
                        }
                    });
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

        public async Task<byte[]> ExporterEmploiDuTempsExcelAsync(EmploiDuTempsExportDto dto)
        {
            var query = _context.Set<SeanceCours>()
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .AsQueryable();

            if (dto.SalleId.HasValue) query = query.Where(s => s.SalleId == dto.SalleId.Value);
            if (dto.NiveauId.HasValue) query = query.Where(s => s.NiveauId == dto.NiveauId.Value);
            if (dto.ParcoursId.HasValue) query = query.Where(s => s.ParcoursId == dto.ParcoursId.Value);
            if (dto.ProfesseurId.HasValue) query = query.Where(s => s.ProfesseurId == dto.ProfesseurId.Value);
            if (dto.UtilisateurId.HasValue) query = query.Where(s => s.ProfesseurId == dto.UtilisateurId.Value);

            var seances = await query.ToListAsync();
            var jours = new[] { "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" };
            var plagesHoraires = new[]
            {
                new TimeSpan(7, 0, 0), new TimeSpan(8, 0, 0), new TimeSpan(9, 0, 0),
                new TimeSpan(10, 0, 0), new TimeSpan(11, 0, 0), new TimeSpan(12, 0, 0),
                new TimeSpan(13, 0, 0), new TimeSpan(14, 0, 0), new TimeSpan(15, 0, 0),
                new TimeSpan(16, 0, 0), new TimeSpan(17, 0, 0)
            };

            using var workbook = new XLWorkbook();
            var feuille = workbook.Worksheets.Add("Emploi du Temps");

            feuille.Cell(1, 1).Value = "EMPLOI DU TEMPS";
            feuille.Cell(1, 1).Style.Font.Bold = true;
            feuille.Cell(1, 1).Style.Font.FontSize = 14;

            feuille.Cell(3, 1).Value = "HORAIRES";
            feuille.Cell(3, 1).Style.Font.Bold = true;
            for (int i = 0; i < jours.Length; i++)
            {
                feuille.Cell(3, i + 2).Value = jours[i].ToUpper();
                feuille.Cell(3, i + 2).Style.Font.Bold = true;
                feuille.Cell(3, i + 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            int row = 4;
            foreach (var plage in plagesHoraires)
            {
                var heureFin = plage.Add(new TimeSpan(1, 0, 0));
                feuille.Cell(row, 1).Value = $"{plage.Hours:D2}h00 - {heureFin.Hours:D2}h00";
                for (int i = 0; i < jours.Length; i++)
                {
                    var jour = jours[i];
                    var seance = seances.FirstOrDefault(s => s.Creneau != null && s.Creneau.Jour == jour && s.Creneau.HeureDebut == plage);
                    if (seance != null)
                    {
                        feuille.Cell(row, i + 2).Value = $"{seance.Matiere?.Nom}\n({seance.Professeur?.Nom})";
                        feuille.Cell(row, i + 2).Style.Alignment.WrapText = true;
                    }
                }
                row++;
            }

            feuille.Columns().AdjustToContents();
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> ExporterExamenTimetablePdfAsync(EmploiDuTempsExportDto dto)
        {
            // Using the same logic as AvisEtudiants but formatted as a timetable if possible, 
            // or just a detailed list. Let's do a detailed list for exams.
            var query = _context.Set<SeanceCours>()
                .Include(s => s.Matiere)
                .Include(s => s.Professeur)
                .Include(s => s.Salle)
                .Include(s => s.Creneau)
                .AsQueryable();
            
            // Filter for exams only if there's a flag, otherwise we assume the request is for exams.
            // Actually, the user wants "export an exam timetable". 
            // I'll use the same filter logic as ExporterAvisEtudiantsPdfAsync but a different layout.
            
            if (dto.NiveauId.HasValue) query = query.Where(s => s.NiveauId == dto.NiveauId.Value);
            if (dto.ParcoursId.HasValue) query = query.Where(s => s.ParcoursId == dto.ParcoursId.Value);

            var seances = await query.ToListAsync();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.Header().AlignCenter().Text("EMPLOI DU TEMPS DES EXAMENS").Bold().FontSize(16);
                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });
                        table.Header(header =>
                        {
                            header.Cell().Text("Date").Bold();
                            header.Cell().Text("Heure").Bold();
                            header.Cell().Text("Matière").Bold();
                            header.Cell().Text("Salle").Bold();
                        });
                        foreach (var s in seances)
                        {
                            table.Cell().Text(s.DateDebutAnnee.ToString("dd/MM/yyyy"));
                            table.Cell().Text($"{s.Creneau?.HeureDebut.Hours:D2}h");
                            table.Cell().Text(s.Matiere?.Nom ?? "");
                            table.Cell().Text(s.Salle?.Libelle ?? "");
                        }
                    });
                });
            });
            return document.GeneratePdf();
        }

        public async Task<byte[]> ExporterReservationPdfAsync(int reservationId)
        {
            var reservation = await _context.Set<Reservation>()
                .Include(r => r.Utilisateur)
                .Include(r => r.Salle)
                .Include(r => r.Evenement)
                .Include(r => r.Parcours)
                .Include(r => r.Niveau)
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null) throw new Exception("Reservation not found");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2.5f, Unit.Centimetre);

                    // ── 1. EN-TÊTE CADRE ──────────────────────────────────
                    page.Header().Column(col =>
                    {
                        col.Item().Border(1).BorderColor(Colors.Black).Padding(10).Column(box =>
                        {
                            box.Item().DefaultTextStyle(style => style.FontSize(11).Bold())
                                .AlignCenter().Text("UNIVERSITÉ DE FIANARANTSOA");

                            box.Item().DefaultTextStyle(style => style.FontSize(10).Bold())
                                .AlignCenter().Text("ÉCOLE DE MANAGEMENT ET D'INNOVATION TECHNOLOGIQUE");

                            box.Item().DefaultTextStyle(style => style.FontSize(10).Bold().LetterSpacing(2))
                                .AlignCenter().Text("E.M.I.T.");

                            box.Item().PaddingTop(6).DefaultTextStyle(style => style.FontSize(8))
                                .AlignCenter().Text("TÉL : 034 00 000 00 — BP : 000 — FIANARANTSOA");

                            box.Item().DefaultTextStyle(style => style.FontSize(8))
                                .AlignCenter().Text("contact@emit.mg");

                            box.Item().DefaultTextStyle(style => style.FontSize(8).Underline())
                                .AlignCenter().Text("www.emit.mg");
                        });

                        // ── 2. TITRE ─────────────────────────────────────────
                        col.Item().PaddingTop(20).AlignCenter()
                            .Text("ANNÉE UNIVERSITAIRE 2025 — 2026")
                            .FontSize(10).Bold();

                        col.Item().PaddingTop(14).AlignCenter()
                            .Text("CONFIRMATION DE RÉSERVATION")
                            .FontSize(16).Bold().Underline();

                        col.Item().PaddingTop(8).AlignCenter()
                            .Text("FICHE DE RÉSERVATION :")
                            .FontSize(12).Bold();
                    });

                    // ── 3. TABLEAU ──────────────────────────────────────────────
                    page.Content().PaddingTop(18).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(70);
                            columns.ConstantColumn(55);
                            columns.ConstantColumn(75);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("DATE").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("HEURE").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("SALLE\nRÉSERVÉE").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("RESPONSABLE / ENSEIGNANT").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("MOTIF / ÉVÉNEMENT").FontSize(7).Bold();
                        });

                        var r = reservation;
                        var heure = r.HeureDebut ?? r.Session ?? "—";
                        var enseignant = $"{r.Utilisateur?.Nom} {r.Utilisateur?.Prenom}";
                        var typeEvt = r.Evenement?.Description ?? "";
                        var contexte = r.Evenement?.Nom ?? "—";
                        if (!string.IsNullOrEmpty(typeEvt))
                            contexte = $"{contexte} ({typeEvt})";
                        if (!string.IsNullOrEmpty(r.Parcours?.Nom) || !string.IsNullOrEmpty(r.Niveau?.Code))
                            contexte += $" — {r.Parcours?.Nom} {r.Niveau?.Code}";

                        table.Cell().Border(0.5f).BorderColor(Colors.Black)
                            .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                            .Text(r.DateReservation.ToString("dd/MM/yyyy")).FontSize(7);
                        table.Cell().Border(0.5f).BorderColor(Colors.Black)
                            .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                            .Text(heure).FontSize(7);
                        table.Cell().Border(0.5f).BorderColor(Colors.Black)
                            .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                            .Text(r.Salle?.Libelle ?? "—").FontSize(7).SemiBold();
                        table.Cell().Border(0.5f).BorderColor(Colors.Black)
                            .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                            .Text(enseignant).FontSize(7);
                        table.Cell().Border(0.5f).BorderColor(Colors.Black)
                            .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                            .Text(contexte).FontSize(7);

                        // ── Ligne info statut ──────────────────────────────
                        table.Cell().ColumnSpan(5).Border(0.5f).BorderColor(Colors.Black)
                            .PaddingVertical(5).PaddingHorizontal(4)
                            .Text($"Statut : {r.Statut}").FontSize(7).SemiBold();
                    });

                    // ── 4. REMARQUES / SIGNATURE ───────────────────────────
                    page.Footer().Column(footer =>
                    {
                        footer.Item().PaddingTop(20)
                            .Text("NB : — Cette fiche sert de justificatif de réservation de salle.")
                            .FontSize(7).Bold();
                        footer.Item()
                            .Text("— Se munir d'une pièce justificative (carte d'étudiant ou badge) pour accéder à la salle.")
                            .FontSize(7).SemiBold();
                        footer.Item()
                            .Text("— Le retard de plus de 15 minutes entraîne l'annulation automatique de la réservation.")
                            .FontSize(7).SemiBold();
                        footer.Item()
                            .Text("— Respecter les consignes de propreté et de sécurité dans les locaux.")
                            .FontSize(7);

                        footer.Item().PaddingTop(24).AlignRight().Column(sig =>
                        {
                            sig.Item().AlignRight()
                                .Text($"Fait à Fianarantsoa, le {DateTime.Now:dd MMMM yyyy}")
                                .FontSize(7);
                            sig.Item().PaddingTop(4).AlignRight()
                                .Text("Le Responsable des Salles")
                                .FontSize(7).Bold();
                            sig.Item().PaddingTop(24).AlignRight()
                                .Text("RAKOTOARISOA Rindra Helisoa Bakoliniaina")
                                .FontSize(7);
                        });

                        footer.Item().PaddingTop(4).AlignCenter()
                            .Text($"Généré le {DateTime.Now:dd/MM/yyyy HH:mm}")
                            .FontSize(6).FontColor(Colors.Grey.Medium);
                    });
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> ExporterListeReservationsPdfAsync(ReservationListExportDto dto)
        {
            var query = _context.Set<Reservation>()
                .Include(r => r.Utilisateur)
                .Include(r => r.Salle)
                .Include(r => r.Evenement)
                .Include(r => r.Parcours)
                .Include(r => r.Niveau)
                .AsQueryable();

            if (dto.SalleId.HasValue)
                query = query.Where(r => r.SalleId == dto.SalleId.Value);
            if (dto.DateDebut.HasValue)
                query = query.Where(r => r.DateReservation >= dto.DateDebut.Value);
            if (dto.DateFin.HasValue)
                query = query.Where(r => r.DateReservation <= dto.DateFin.Value);
            if (!string.IsNullOrEmpty(dto.Statut))
                query = query.Where(r => r.Statut == dto.Statut);

            var reservations = await query
                .OrderByDescending(r => r.DateReservation)
                .ToListAsync();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2.5f, Unit.Centimetre);

                    // ── 1. EN-TÊTE CADRE ──────────────────────────────────
                    page.Header().Column(col =>
                    {
                        col.Item().Border(1).BorderColor(Colors.Black).Padding(10).Column(box =>
                        {
                            box.Item().DefaultTextStyle(style => style.FontSize(11).Bold())
                                .AlignCenter().Text("UNIVERSITÉ DE FIANARANTSOA");

                            box.Item().DefaultTextStyle(style => style.FontSize(10).Bold())
                                .AlignCenter().Text("ÉCOLE DE MANAGEMENT ET D'INNOVATION TECHNOLOGIQUE");

                            box.Item().DefaultTextStyle(style => style.FontSize(10).Bold().LetterSpacing(2))
                                .AlignCenter().Text("E.M.I.T.");

                            box.Item().PaddingTop(6).DefaultTextStyle(style => style.FontSize(8))
                                .AlignCenter().Text("TÉL : 034 00 000 00 — BP : 000 — FIANARANTSOA");

                            box.Item().DefaultTextStyle(style => style.FontSize(8))
                                .AlignCenter().Text("contact@emit.mg");

                            box.Item().DefaultTextStyle(style => style.FontSize(8).Underline())
                                .AlignCenter().Text("www.emit.mg");
                        });

                        // ── 2. TITRE ─────────────────────────────────────────
                        col.Item().PaddingTop(20).AlignCenter()
                            .Text("ANNÉE UNIVERSITAIRE 2025 — 2026")
                            .FontSize(10).Bold();

                        col.Item().PaddingTop(14).AlignCenter()
                            .Text("LISTE DES RÉSERVATIONS DE SALLES")
                            .FontSize(16).Bold().Underline();

                        col.Item().PaddingTop(8).AlignCenter()
                            .Text("RÉSERVATIONS :")
                            .FontSize(12).Bold();
                    });

                    // ── 3. TABLEAU PRINCIPAL ────────────────────────────────
                    page.Content().PaddingTop(18).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(70);
                            columns.ConstantColumn(55);
                            columns.ConstantColumn(75);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("DATE").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("HEURE").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("SALLE\nRÉSERVÉE").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("RESPONSABLE / ENSEIGNANT").FontSize(7).Bold();
                            header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3)
                                .PaddingVertical(5).PaddingHorizontal(4).AlignCenter()
                                .Text("MOTIF / ÉVÉNEMENT").FontSize(7).Bold();
                        });

                        foreach (var r in reservations)
                        {
                            var heure = r.HeureDebut ?? r.Session ?? "—";
                            var enseignant = $"{r.Utilisateur?.Nom} {r.Utilisateur?.Prenom}";
                            var typeEvt = r.Evenement?.Description ?? "";
                            var contexte = r.Evenement?.Nom ?? "—";
                            if (!string.IsNullOrEmpty(typeEvt))
                                contexte = $"{contexte} ({typeEvt})";
                            if (!string.IsNullOrEmpty(r.Parcours?.Nom) || !string.IsNullOrEmpty(r.Niveau?.Code))
                                contexte += $" — {r.Parcours?.Nom} {r.Niveau?.Code}";

                            table.Cell().Border(0.5f).BorderColor(Colors.Black)
                                .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                                .Text(r.DateReservation.ToString("dd/MM/yyyy")).FontSize(7);
                            table.Cell().Border(0.5f).BorderColor(Colors.Black)
                                .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                                .Text(heure).FontSize(7);
                            table.Cell().Border(0.5f).BorderColor(Colors.Black)
                                .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                                .Text(r.Salle?.Libelle ?? "—").FontSize(7).SemiBold();
                            table.Cell().Border(0.5f).BorderColor(Colors.Black)
                                .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                                .Text(enseignant).FontSize(7);
                            table.Cell().Border(0.5f).BorderColor(Colors.Black)
                                .PaddingVertical(4).PaddingHorizontal(4).AlignCenter()
                                .Text(contexte).FontSize(7);
                        }
                    });

                    // ── 4. REMARQUES / CONSIGNES ────────────────────────────
                    page.Footer().Column(footer =>
                    {
                        footer.Item().PaddingTop(20)
                            .Text("NB : — Les réservations doivent être confirmées au moins 48h à l'avance.")
                            .FontSize(7).Bold();
                        footer.Item()
                            .Text("— Se munir d'une pièce justificative (carte d'étudiant ou badge) pour accéder à la salle.")
                            .FontSize(7).SemiBold();
                        footer.Item()
                            .Text("— Le retard de plus de 15 minutes entraîne l'annulation automatique de la réservation.")
                            .FontSize(7).SemiBold();
                        footer.Item()
                            .Text("— Respecter les consignes de propreté et de sécurité dans les locaux.")
                            .FontSize(7);

                        // ── 5. SIGNATURE ────────────────────────────────────────
                        footer.Item().PaddingTop(24).AlignRight().Column(sig =>
                        {
                            sig.Item().AlignRight()
                                .Text($"Fait à Fianarantsoa, le {DateTime.Now:dd MMMM yyyy}")
                                .FontSize(7);
                            sig.Item().PaddingTop(4).AlignRight()
                                .Text("Le Responsable des Salles")
                                .FontSize(7).Bold();
                            sig.Item().PaddingTop(24).AlignRight()
                                .Text("RAKOTOARISOA Rindra Helisoa Bakoliniaina")
                                .FontSize(7);
                        });

                        footer.Item().PaddingTop(4).AlignCenter()
                            .Text($"Généré le {DateTime.Now:dd/MM/yyyy HH:mm}")
                            .FontSize(6).FontColor(Colors.Grey.Medium);
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
