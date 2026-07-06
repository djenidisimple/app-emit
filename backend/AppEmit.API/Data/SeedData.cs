using AppEmit.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Data;

public static class SeedData
{
    public static void SeedAll(AppDbContext context)
    {
        // ── S'assurer que les rôles de base existent ──
        if (!context.Roles.Any())
        {
            var roles = new List<Role>
            {
                new() { Nom = "Admin" },
                new() { Nom = "Professeur" },
                new() { Nom = "Etudiant" },
            };
            context.Roles.AddRange(roles);
            context.SaveChanges();
            Console.WriteLine("[SEED] Rôles créés !");
        }

        // ── Backfill Role for existing users (pre-AlignConceptionModel) ──
        if (context.Utilisateurs.Any(u => u.Role == null))
        {
            context.Database.ExecuteSqlRaw("UPDATE \"Utilisateurs\" SET \"Role\" = 'Admin' WHERE \"Matricule\" LIKE 'ADM%' AND \"Role\" IS NULL");
            context.Database.ExecuteSqlRaw("UPDATE \"Utilisateurs\" SET \"Role\" = 'Professeur' WHERE \"Matricule\" LIKE 'PROF%' AND \"Role\" IS NULL");
            context.Database.ExecuteSqlRaw("UPDATE \"Utilisateurs\" SET \"Role\" = 'Etudiant' WHERE \"Matricule\" LIKE 'ETU%' AND \"Role\" IS NULL");
            Console.WriteLine("[SEED] Role backfill effectué !");
        }

        // ── Niveaux pour le parcours Management ──
        var parcoursMgmt = context.Parcours.FirstOrDefault(p => p.Nom == "Management");
        if (parcoursMgmt != null && !context.Niveaux.Any(n => n.ParcoursId == parcoursMgmt.Id))
        {
            var mgmtNiveaux = new List<Niveau>
            {
                new() { Code = "L1", ParcoursId = parcoursMgmt.Id },
                new() { Code = "L2", ParcoursId = parcoursMgmt.Id },
                new() { Code = "L3", ParcoursId = parcoursMgmt.Id },
                new() { Code = "M1", ParcoursId = parcoursMgmt.Id },
                new() { Code = "M2", ParcoursId = parcoursMgmt.Id },
            };
            context.Niveaux.AddRange(mgmtNiveaux);
            context.SaveChanges();
            Console.WriteLine("[SEED] Niveaux Management créés !");
        }

        // ── Matières supplémentaires (TD, TP, et nouvelles matières) ──
        if (!context.Matieres.Any(m => m.Code == "INF411"))
        {
            var matieres = new List<Matiere>
            {
                new() { Code = "INF411", Nom = "Génie Logiciel (TD)", Type = "TD" },
                new() { Code = "INF412", Nom = "Génie Logiciel (TP)", Type = "TP" },
                new() { Code = "INF421", Nom = "Base de Données (TD)", Type = "TD" },
                new() { Code = "INF422", Nom = "Base de Données (TP)", Type = "TP" },
                new() { Code = "INF431", Nom = "Réseaux (TD)", Type = "TD" },
                new() { Code = "INF432", Nom = "Réseaux (TP)", Type = "TP" },
                new() { Code = "INF441", Nom = "Programmation Web (TD)", Type = "TD" },
                new() { Code = "INF442", Nom = "Programmation Web (TP)", Type = "TP" },
                new() { Code = "MGT411", Nom = "Management (TD)", Type = "TD" },
                new() { Code = "INF405", Nom = "Intelligence Artificielle", Type = "Cours" },
                new() { Code = "INF406", Nom = "Cybersécurité", Type = "Cours" },
                new() { Code = "INF407", Nom = "Cloud Computing", Type = "Cours" },
                new() { Code = "MGT402", Nom = "Entrepreneuriat", Type = "Cours" },
                new() { Code = "INF455", Nom = "Intelligence Artificielle (TD)", Type = "TD" },
                new() { Code = "INF456", Nom = "Cloud Computing (TP)", Type = "TP" },
            };
            context.Matieres.AddRange(matieres);
            context.SaveChanges();
            Console.WriteLine("[SEED] Matières supplémentaires créées !");
        }

        // ── Utilisateurs supplémentaires ──
        if (!context.Utilisateurs.Any(u => u.Matricule == "ETU002"))
        {
            var profRole = context.Roles.FirstOrDefault(r => r.Nom == "Professeur");
            var etudiantRole = context.Roles.FirstOrDefault(r => r.Nom == "Etudiant");
            if (profRole == null || etudiantRole == null)
            {
                Console.WriteLine("[SEED] ERREUR: Rôles 'Professeur' ou 'Etudiant' introuvables !");
                return;
            }

            var niveaux = context.Niveaux.Include(n => n.Parcours).ToList();
            var l3Info = niveaux.FirstOrDefault(n => n.Code == "L3" && n.Parcours.Nom == "Informatique");
            var m1Info = niveaux.FirstOrDefault(n => n.Code == "M1" && n.Parcours.Nom == "Informatique");
            var m2Info = niveaux.FirstOrDefault(n => n.Code == "M2" && n.Parcours.Nom == "Informatique");
            var m1Mgmt = niveaux.FirstOrDefault(n => n.Code == "M1" && n.Parcours.Nom == "Management");
            var m2Mgmt = niveaux.FirstOrDefault(n => n.Code == "M2" && n.Parcours.Nom == "Management");
            var l1Info = niveaux.FirstOrDefault(n => n.Code == "L1" && n.Parcours.Nom == "Informatique");

            if (l3Info == null || m1Info == null || m2Info == null || m1Mgmt == null || m2Mgmt == null || l1Info == null)
            {
                Console.WriteLine("[SEED] ERREUR: Niveaux requis introuvables !");
                return;
            }

            if (!context.Utilisateurs.Any(u => u.Matricule == "PROF003"))
            {
                var prof3 = new Utilisateur
                {
                    Nom = "Andriamahazo", Prenom = "Tiana", Email = "prof3@emit.mg",
                    MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("prof123"),
                    Role = "Professeur", Matricule = "PROF003",
                    DateNaissance = new DateTime(1985, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                    Adresse = "Antananarivo",
                    Roles = new List<Role> { profRole }
                };
                context.Utilisateurs.Add(prof3);
            }

            if (!context.Utilisateurs.Any(u => u.Matricule == "PROF004"))
            {
                var prof4 = new Utilisateur
                {
                    Nom = "Rajaonarison", Prenom = "Lala", Email = "prof4@emit.mg",
                    MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("prof123"),
                    Role = "Professeur", Matricule = "PROF004",
                    DateNaissance = new DateTime(1978, 7, 22, 0, 0, 0, DateTimeKind.Utc),
                    Adresse = "Antananarivo",
                    Roles = new List<Role> { profRole }
                };
                context.Utilisateurs.Add(prof4);
            }

            if (!context.Utilisateurs.Any(u => u.Matricule == "PROF005"))
            {
                var prof5 = new Utilisateur
                {
                    Nom = "Ratsimbazafy", Prenom = "Hery", Email = "prof5@emit.mg",
                    MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("prof123"),
                    Role = "Professeur", Matricule = "PROF005",
                    DateNaissance = new DateTime(1982, 11, 8, 0, 0, 0, DateTimeKind.Utc),
                    Adresse = "Antananarivo",
                    Roles = new List<Role> { profRole }
                };
                context.Utilisateurs.Add(prof5);
            }

            var etudiants = new List<Utilisateur>
            {
                new() { Nom = "Rakotomalala", Prenom = "Mialy", Email = "etu002@emit.mg", MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"), Role = "Etudiant", Matricule = "ETU002", NiveauId = l3Info.Id, DateNaissance = new DateTime(2002, 5, 10, 0, 0, 0, DateTimeKind.Utc), Adresse = "Antananarivo", Roles = new List<Role> { etudiantRole } },
                new() { Nom = "Razafindrabe", Prenom = "Tahina", Email = "etu003@emit.mg", MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"), Role = "Etudiant", Matricule = "ETU003", NiveauId = m1Info.Id, DateNaissance = new DateTime(2001, 8, 22, 0, 0, 0, DateTimeKind.Utc), Adresse = "Fianarantsoa", Roles = new List<Role> { etudiantRole } },
                new() { Nom = "Andrianantenaina", Prenom = "Mamisoa", Email = "etu004@emit.mg", MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"), Role = "Etudiant", Matricule = "ETU004", NiveauId = m2Info.Id, DateNaissance = new DateTime(2000, 2, 14, 0, 0, 0, DateTimeKind.Utc), Adresse = "Toamasina", Roles = new List<Role> { etudiantRole } },
                new() { Nom = "Rakotoson", Prenom = "Feno", Email = "etu005@emit.mg", MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"), Role = "Etudiant", Matricule = "ETU005", NiveauId = m1Mgmt.Id, DateNaissance = new DateTime(2001, 11, 30, 0, 0, 0, DateTimeKind.Utc), Adresse = "Antsirabe", Roles = new List<Role> { etudiantRole } },
                new() { Nom = "Rasolof", Prenom = "Miora", Email = "etu006@emit.mg", MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"), Role = "Etudiant", Matricule = "ETU006", NiveauId = m2Mgmt.Id, DateNaissance = new DateTime(2000, 9, 5, 0, 0, 0, DateTimeKind.Utc), Adresse = "Antananarivo", Roles = new List<Role> { etudiantRole } },
                new() { Nom = "Ravelo", Prenom = "Njaka", Email = "etu007@emit.mg", MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("etud123"), Role = "Etudiant", Matricule = "ETU007", NiveauId = l1Info.Id, DateNaissance = new DateTime(2004, 4, 18, 0, 0, 0, DateTimeKind.Utc), Adresse = "Mahajanga", Roles = new List<Role> { etudiantRole } },
            };

            foreach (var etu in etudiants)
            {
                if (!context.Utilisateurs.Any(u => u.Matricule == etu.Matricule))
                    context.Utilisateurs.Add(etu);
            }

            context.SaveChanges();
            Console.WriteLine("[SEED] Utilisateurs supplémentaires créés !");
        }

        // ── Séances de cours (emploi du temps hebdomadaire) ──
        if (!context.SeancesCours.Any())
        {
            var matieres = context.Matieres.ToList();
            var salles = context.Salles.ToList();
            var creneaux = context.Creneaux.OrderBy(c => c.Id).ToList();
            var niveaux = context.Niveaux.Include(n => n.Parcours).ToList();
            var profs = context.Utilisateurs.Include(u => u.Roles).Where(u => u.Roles.Any(r => r.Nom == "Professeur")).ToList();

            var mGL = matieres.FirstOrDefault(m => m.Code == "INF401");
            var mBD = matieres.FirstOrDefault(m => m.Code == "INF402");
            var mRES = matieres.FirstOrDefault(m => m.Code == "INF403");
            var mPW = matieres.FirstOrDefault(m => m.Code == "INF404");
            var mMGMT = matieres.FirstOrDefault(m => m.Code == "MGT401");
            var mGLTD = matieres.FirstOrDefault(m => m.Code == "INF411");
            var mGLTP = matieres.FirstOrDefault(m => m.Code == "INF412");
            var mBDTD = matieres.FirstOrDefault(m => m.Code == "INF421");
            var mBDTP = matieres.FirstOrDefault(m => m.Code == "INF422");
            var mRESTD = matieres.FirstOrDefault(m => m.Code == "INF431");
            var mRESTP = matieres.FirstOrDefault(m => m.Code == "INF432");
            var mPWTD = matieres.FirstOrDefault(m => m.Code == "INF441");
            var mPWTP = matieres.FirstOrDefault(m => m.Code == "INF442");
            var mMGMTTD = matieres.FirstOrDefault(m => m.Code == "MGT411");
            var mIA = matieres.FirstOrDefault(m => m.Code == "INF405");
            var mCYBER = matieres.FirstOrDefault(m => m.Code == "INF406");
            var mCLOUD = matieres.FirstOrDefault(m => m.Code == "INF407");
            var mENTR = matieres.FirstOrDefault(m => m.Code == "MGT402");
            var mIATD = matieres.FirstOrDefault(m => m.Code == "INF455");
            var mCLOUDTP = matieres.FirstOrDefault(m => m.Code == "INF456");

            var amphi1 = salles.FirstOrDefault(s => s.CodeSalle == "A101");
            var amphi2 = salles.FirstOrDefault(s => s.CodeSalle == "A102");
            var tp01 = salles.FirstOrDefault(s => s.CodeSalle == "TP01");
            var tp02 = salles.FirstOrDefault(s => s.CodeSalle == "TP02");
            var td01 = salles.FirstOrDefault(s => s.CodeSalle == "TD01");
            var td02 = salles.FirstOrDefault(s => s.CodeSalle == "TD02");

            var p1 = profs.FirstOrDefault(p => p.Matricule == "PROF001");
            var p2 = profs.FirstOrDefault(p => p.Matricule == "PROF002");
            var p3 = profs.FirstOrDefault(p => p.Matricule == "PROF003");
            var p4 = profs.FirstOrDefault(p => p.Matricule == "PROF004");
            var p5 = profs.FirstOrDefault(p => p.Matricule == "PROF005");

            var l3Info = niveaux.FirstOrDefault(n => n.Code == "L3" && n.Parcours.Nom == "Informatique");
            var m1Info = niveaux.FirstOrDefault(n => n.Code == "M1" && n.Parcours.Nom == "Informatique");
            var m2Info = niveaux.FirstOrDefault(n => n.Code == "M2" && n.Parcours.Nom == "Informatique");
            var m1Mgmt = niveaux.FirstOrDefault(n => n.Code == "M1" && n.Parcours.Nom == "Management");
            var m2Mgmt = niveaux.FirstOrDefault(n => n.Code == "M2" && n.Parcours.Nom == "Management");

            if (mGL == null || mBD == null || mRES == null || mPW == null || mMGMT == null
                || amphi1 == null || amphi2 == null || tp01 == null || tp02 == null || td01 == null || td02 == null
                || p1 == null || p2 == null || p3 == null || p4 == null || p5 == null
                || l3Info == null || m1Info == null || m2Info == null || m1Mgmt == null || m2Mgmt == null)
            {
                Console.WriteLine("[SEED] ERREUR: Données de base insuffisantes pour créer les séances !");
                return;
            }

            var dateDebut = new DateTime(2025, 10, 1, 0, 0, 0, DateTimeKind.Utc);
            var dateFin = new DateTime(2026, 9, 30, 0, 0, 0, DateTimeKind.Utc);

            var seances = new List<SeanceCours>
            {
                // ── Lundi ──
                new() { MatiereId = mGL.Id, ProfesseurId = p1.Id, SalleId = amphi1.Id, CreneauId = creneaux[0].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#3B82F6" },
                new() { MatiereId = mBD.Id, ProfesseurId = p2.Id, SalleId = amphi1.Id, CreneauId = creneaux[1].Id, ParcoursId = l3Info.ParcoursId, NiveauId = l3Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#10B981" },
                new() { MatiereId = mRESTD.Id, ProfesseurId = p1.Id, SalleId = td01.Id, CreneauId = creneaux[2].Id, ParcoursId = l3Info.ParcoursId, NiveauId = l3Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#F59E0B" },
                new() { MatiereId = mPWTP.Id, ProfesseurId = p3.Id, SalleId = tp01.Id, CreneauId = creneaux[3].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#8B5CF6" },

                // ── Mardi ──
                new() { MatiereId = mBDTD.Id, ProfesseurId = p2.Id, SalleId = td02.Id, CreneauId = creneaux[4].Id, ParcoursId = l3Info.ParcoursId, NiveauId = l3Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#10B981" },
                new() { MatiereId = mGLTD.Id, ProfesseurId = p1.Id, SalleId = td01.Id, CreneauId = creneaux[5].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#3B82F6" },
                new() { MatiereId = mMGMT.Id, ProfesseurId = p4.Id, SalleId = amphi2.Id, CreneauId = creneaux[6].Id, ParcoursId = m1Mgmt.ParcoursId, NiveauId = m1Mgmt.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#EC4899" },
                new() { MatiereId = mIA.Id, ProfesseurId = p5.Id, SalleId = amphi1.Id, CreneauId = creneaux[7].Id, ParcoursId = m2Info.ParcoursId, NiveauId = m2Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#EF4444" },

                // ── Mercredi ──
                new() { MatiereId = mRES.Id, ProfesseurId = p1.Id, SalleId = amphi1.Id, CreneauId = creneaux[8].Id, ParcoursId = l3Info.ParcoursId, NiveauId = l3Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#F59E0B" },
                new() { MatiereId = mPW.Id, ProfesseurId = p3.Id, SalleId = amphi1.Id, CreneauId = creneaux[9].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#8B5CF6" },
                new() { MatiereId = mGLTP.Id, ProfesseurId = p2.Id, SalleId = tp01.Id, CreneauId = creneaux[10].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#3B82F6" },
                new() { MatiereId = mCYBER.Id, ProfesseurId = p5.Id, SalleId = amphi1.Id, CreneauId = creneaux[11].Id, ParcoursId = m2Info.ParcoursId, NiveauId = m2Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#DC2626" },

                // ── Jeudi ──
                new() { MatiereId = mBDTP.Id, ProfesseurId = p2.Id, SalleId = tp02.Id, CreneauId = creneaux[12].Id, ParcoursId = l3Info.ParcoursId, NiveauId = l3Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#10B981" },
                new() { MatiereId = mMGMTTD.Id, ProfesseurId = p4.Id, SalleId = td02.Id, CreneauId = creneaux[13].Id, ParcoursId = m1Mgmt.ParcoursId, NiveauId = m1Mgmt.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#EC4899" },
                new() { MatiereId = mIATD.Id, ProfesseurId = p5.Id, SalleId = td01.Id, CreneauId = creneaux[14].Id, ParcoursId = m2Info.ParcoursId, NiveauId = m2Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#EF4444" },
                new() { MatiereId = mCLOUD.Id, ProfesseurId = p3.Id, SalleId = amphi2.Id, CreneauId = creneaux[15].Id, ParcoursId = m2Info.ParcoursId, NiveauId = m2Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#7C3AED" },

                // ── Vendredi ──
                new() { MatiereId = mENTR.Id, ProfesseurId = p4.Id, SalleId = amphi2.Id, CreneauId = creneaux[16].Id, ParcoursId = m2Mgmt.ParcoursId, NiveauId = m2Mgmt.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#F97316" },
                new() { MatiereId = mGL.Id, ProfesseurId = p1.Id, SalleId = amphi1.Id, CreneauId = creneaux[17].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#3B82F6" },
                new() { MatiereId = mPWTD.Id, ProfesseurId = p3.Id, SalleId = td01.Id, CreneauId = creneaux[18].Id, ParcoursId = m1Info.ParcoursId, NiveauId = m1Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#8B5CF6" },

                // ── Samedi ──
                new() { MatiereId = mRESTP.Id, ProfesseurId = p1.Id, SalleId = tp01.Id, CreneauId = creneaux[20].Id, ParcoursId = l3Info.ParcoursId, NiveauId = l3Info.Id, DateDebutAnnee = dateDebut, DateFinAnnee = dateFin, CouleurAffichage = "#F59E0B" },
            };

            context.SeancesCours.AddRange(seances);
            context.SaveChanges();
            Console.WriteLine("[SEED] Séances de cours créées !");
        }

        // ── Événements ──
        if (!context.Evenements.Any())
        {
            var admin = context.Utilisateurs.FirstOrDefault(u => u.Role == "Admin");
            var prof1 = context.Utilisateurs.FirstOrDefault(u => u.Matricule == "PROF001");
            if (admin == null || prof1 == null)
            {
                Console.WriteLine("[SEED] ERREUR: Admin ou PROF001 introuvable pour les événements !");
                return;
            }

            var evenements = new List<Evenement>
            {
                new() { Nom = "Conférence IA et Avenir du Travail", Description = "Conférence avec des experts en intelligence artificielle et son impact sur le monde professionnel", DateEvenement = new DateTime(2026, 6, 15, 9, 0, 0, DateTimeKind.Utc), OrganisateurId = admin.Id },
                new() { Nom = "Soutenance de Projets M2", Description = "Soutenance des projets de fin d'études des étudiants de Master 2", DateEvenement = new DateTime(2026, 6, 20, 8, 0, 0, DateTimeKind.Utc), OrganisateurId = prof1.Id },
                new() { Nom = "Réunion Pédagogique", Description = "Réunion des enseignants pour le bilan de l'année académique 2025-2026", DateEvenement = new DateTime(2026, 6, 10, 14, 0, 0, DateTimeKind.Utc), OrganisateurId = admin.Id },
                new() { Nom = "Atelier DevOps", Description = "Workshop pratique sur les outils DevOps (Docker, CI/CD, Kubernetes)", DateEvenement = new DateTime(2026, 6, 18, 9, 0, 0, DateTimeKind.Utc), OrganisateurId = prof1.Id },
            };
            context.Evenements.AddRange(evenements);
            context.SaveChanges();
            Console.WriteLine("[SEED] Événements créés !");
        }

        // ── Réservations ──
        if (!context.Reservations.Any())
        {
            var admin = context.Utilisateurs.FirstOrDefault(u => u.Role == "Admin");
            var prof1 = context.Utilisateurs.FirstOrDefault(u => u.Matricule == "PROF001");
            var amphi1 = context.Salles.FirstOrDefault(s => s.CodeSalle == "A101");
            var amphi2 = context.Salles.FirstOrDefault(s => s.CodeSalle == "A102");
            var td01 = context.Salles.FirstOrDefault(s => s.CodeSalle == "TD01");
            var tp01 = context.Salles.FirstOrDefault(s => s.CodeSalle == "TP01");
            var confIA = context.Evenements.FirstOrDefault(e => e.Nom.StartsWith("Conférence"));
            var soutenance = context.Evenements.FirstOrDefault(e => e.Nom.StartsWith("Soutenance"));
            var reunion = context.Evenements.FirstOrDefault(e => e.Nom.StartsWith("Réunion"));
            var atelier = context.Evenements.FirstOrDefault(e => e.Nom.StartsWith("Atelier"));

            if (admin == null || prof1 == null || amphi1 == null || amphi2 == null || td01 == null || tp01 == null
                || confIA == null || soutenance == null || reunion == null || atelier == null)
            {
                Console.WriteLine("[SEED] ERREUR: Données insuffisantes pour les réservations !");
                return;
            }

            var reservations = new List<Reservation>
            {
                new() { UtilisateurId = admin.Id, EvenementId = confIA.Id, SalleId = amphi1.Id, DateReservation = new DateTime(2026, 6, 15, 0, 0, 0, DateTimeKind.Utc), Session = "Matin", Statut = "Confirmée" },
                new() { UtilisateurId = prof1.Id, EvenementId = soutenance.Id, SalleId = amphi2.Id, DateReservation = new DateTime(2026, 6, 20, 0, 0, 0, DateTimeKind.Utc), Session = "Matin", Statut = "Confirmée" },
                new() { UtilisateurId = admin.Id, EvenementId = reunion.Id, SalleId = td01.Id, DateReservation = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc), Session = "Après-midi", Statut = "Confirmée" },
                new() { UtilisateurId = prof1.Id, EvenementId = atelier.Id, SalleId = tp01.Id, DateReservation = new DateTime(2026, 6, 18, 0, 0, 0, DateTimeKind.Utc), Session = "Matin", Statut = "En attente" },
            };
            context.Reservations.AddRange(reservations);
            context.SaveChanges();
            Console.WriteLine("[SEED] Réservations créées !");
        }

        // ── Paiements ──
        if (!context.Paiements.Any())
        {
            var reservations = context.Reservations.Include(r => r.Evenement).ToList();
            var confReservation = reservations.FirstOrDefault(r => r.Evenement.Nom.StartsWith("Conférence"));
            var soutenanceReservation = reservations.FirstOrDefault(r => r.Evenement.Nom.StartsWith("Soutenance"));

            if (confReservation == null || soutenanceReservation == null)
            {
                Console.WriteLine("[SEED] ERREUR: Réservations insuffisantes pour les paiements !");
                return;
            }

            var paiements = new List<Paiement>
            {
                new() { ReservationId = confReservation.Id, Montant = 150000m, DatePaiement = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc), MethodePaiement = "Virement bancaire" },
                new() { ReservationId = soutenanceReservation.Id, Montant = 75000m, DatePaiement = new DateTime(2026, 6, 5, 14, 30, 0, DateTimeKind.Utc), MethodePaiement = "Espèces" },
            };
            context.Paiements.AddRange(paiements);
            context.SaveChanges();
            Console.WriteLine("[SEED] Paiements créés !");
        }

        // ── Notifications ──
        if (!context.Notifications.Any())
        {
            var users = context.Utilisateurs.ToList();
            var admin = users.FirstOrDefault(u => u.Role == "Admin");
            var prof1 = users.FirstOrDefault(u => u.Matricule == "PROF001");
            var prof2 = users.FirstOrDefault(u => u.Matricule == "PROF002");
            var prof3 = users.FirstOrDefault(u => u.Matricule == "PROF003");
            var etu1 = users.FirstOrDefault(u => u.Matricule == "ETU001");
            var etu2 = users.FirstOrDefault(u => u.Matricule == "ETU002");

            if (admin == null || prof1 == null || prof2 == null || prof3 == null || etu1 == null || etu2 == null)
            {
                Console.WriteLine("[SEED] ERREUR: Utilisateurs insuffisants pour les notifications !");
                return;
            }

            var notifications = new List<Notification>
            {
                new() { UtilisateurId = prof1.Id, Message = "Bienvenue sur l'application de gestion des emplois du temps EMIT !", DateEnvoi = DateTime.UtcNow.AddDays(-30), EstLu = true },
                new() { UtilisateurId = prof2.Id, Message = "Bienvenue sur l'application de gestion des emplois du temps EMIT !", DateEnvoi = DateTime.UtcNow.AddDays(-30), EstLu = true },
                new() { UtilisateurId = prof3.Id, Message = "Bienvenue sur l'application de gestion des emplois du temps EMIT !", DateEnvoi = DateTime.UtcNow.AddDays(-30), EstLu = true },
                new() { UtilisateurId = etu1.Id, Message = "Bienvenue sur l'application EMIT. Consultez votre emploi du temps !", DateEnvoi = DateTime.UtcNow.AddDays(-30), EstLu = true },
                new() { UtilisateurId = etu2.Id, Message = "Bienvenue sur l'application EMIT. Consultez votre emploi du temps !", DateEnvoi = DateTime.UtcNow.AddDays(-30), EstLu = true },
                new() { UtilisateurId = prof1.Id, Message = "Rappel : vous avez une séance de Génie Logiciel demain à 08:00 en Amphi 1.", DateEnvoi = DateTime.UtcNow.AddDays(-1), EstLu = false },
                new() { UtilisateurId = prof2.Id, Message = "Votre réservation pour la Soutenance de Projets M2 a été approuvée.", DateEnvoi = DateTime.UtcNow.AddDays(-7), EstLu = false },
                new() { UtilisateurId = admin.Id, Message = "Un nouvel utilisateur s'est inscrit : ETU007 - Njaka Ravelo", DateEnvoi = DateTime.UtcNow.AddDays(-10), EstLu = false },
                new() { UtilisateurId = prof3.Id, Message = "Changement de salle pour votre séance de Programmation Web de demain.", DateEnvoi = DateTime.UtcNow.AddDays(-2), EstLu = false },
                new() { UtilisateurId = prof1.Id, Message = "Votre demande d'échange avec le professeur Rabe a été acceptée.", DateEnvoi = DateTime.UtcNow.AddDays(-5), EstLu = true },
                new() { UtilisateurId = prof2.Id, Message = "Le professeur Rakoto souhaite échanger sa séance du Jeudi avec la vôtre.", DateEnvoi = DateTime.UtcNow.AddDays(-6), EstLu = false },
            };
            context.Notifications.AddRange(notifications);
            context.SaveChanges();
            Console.WriteLine("[SEED] Notifications créées !");
        }

        // ── Exceptions Planning (annulations, reports, déplacements) ──
        if (!context.ExceptionsPlanning.Any())
        {
            var seances = context.SeancesCours.Include(s => s.Matiere).Include(s => s.Creneau).ToList();
            var seanceGL = seances.FirstOrDefault(s => s.Matiere.Code == "INF401");
            var seanceBDCours = seances.FirstOrDefault(s => s.Matiere.Code == "INF402" && s.Creneau.Jour == "Lundi");
            var td02 = context.Salles.FirstOrDefault(s => s.CodeSalle == "TD02");

            if (seanceGL == null || seanceBDCours == null || td02 == null)
            {
                Console.WriteLine("[SEED] ERREUR: Données insuffisantes pour les exceptions planning !");
                return;
            }

            var exceptions = new List<ExceptionPlanning>
            {
                new()
                {
                    SeanceCoursId = seanceGL.Id,
                    DateDebut = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                    DateFin = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                    TypeException = "Annulation",
                    Motif = "Congé du professeur (Rakoto Jean)"
                },
                new()
                {
                    SeanceCoursId = seanceBDCours.Id,
                    DateDebut = new DateTime(2026, 6, 2, 0, 0, 0, DateTimeKind.Utc),
                    TypeException = "Deplacement",
                    Motif = "Travaux de rénovation dans l'Amphi 1",
                    NouvelleSalleId = td02.Id
                },
            };
            context.ExceptionsPlanning.AddRange(exceptions);
            context.SaveChanges();
            Console.WriteLine("[SEED] Exceptions planning créées !");
        }

        // ── Demandes d'échange entre professeurs ──
        if (!context.DemandesEchange.Any())
        {
            var prof1 = context.Utilisateurs.FirstOrDefault(u => u.Matricule == "PROF001");
            var prof2 = context.Utilisateurs.FirstOrDefault(u => u.Matricule == "PROF002");
            var seances = context.SeancesCours.Include(s => s.Matiere).Include(s => s.Creneau).ToList();
            var seanceGL = seances.FirstOrDefault(s => s.Matiere.Code == "INF401");
            var seanceBDCours = seances.FirstOrDefault(s => s.Matiere.Code == "INF402" && s.Creneau.Jour == "Lundi");

            if (prof1 == null || prof2 == null || seanceGL == null || seanceBDCours == null)
            {
                Console.WriteLine("[SEED] ERREUR: Données insuffisantes pour les demandes d'échange !");
                return;
            }

            var demandes = new List<DemandeEchange>
            {
                new()
                {
                    DemandeurId = prof1.Id,
                    CibleId = prof2.Id,
                    SeanceDemandeurId = seanceGL.Id,
                    SeanceCibleId = seanceBDCours.Id,
                    Statut = "Acceptee",
                    Motif = "Conflit d'emploi du temps - besoin de décaler ma séance de GL",
                    DateDemande = new DateTime(2026, 5, 20, 10, 0, 0, DateTimeKind.Utc),
                    DateReponse = new DateTime(2026, 5, 21, 14, 0, 0, DateTimeKind.Utc)
                },
            };
            context.DemandesEchange.AddRange(demandes);
            context.SaveChanges();
            Console.WriteLine("[SEED] Demandes d'échange créées !");
        }
    }
}
