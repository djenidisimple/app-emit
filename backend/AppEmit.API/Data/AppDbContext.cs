using Microsoft.EntityFrameworkCore;
using AppEmit.API.Entities;

namespace AppEmit.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<Filiere> Filieres { get; set; }
        public DbSet<Parcours> Parcours { get; set; }
        public DbSet<Niveau> Niveaux { get; set; }
        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Salle> Salles { get; set; }
        public DbSet<Matiere> Matieres { get; set; }
        public DbSet<Creneau> Creneaux { get; set; }
        public DbSet<SeanceCours> SeancesCours { get; set; }
        public DbSet<Evenement> Evenements { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Paiement> Paiements { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ExceptionPlanning> ExceptionsPlanning { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<DemandeEchange> DemandesEchange { get; set; }
        public DbSet<ImprevuAdmin> ImprevusAdmin { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =========================
            // UTILISATEUR
            // =========================
            modelBuilder.Entity<Utilisateur>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Utilisateur>()
                .Property(u => u.Matricule)
                .IsRequired(false);

            modelBuilder.Entity<Utilisateur>()
                .HasOne(u => u.Niveau)
                .WithMany(n => n.Utilisateurs)
                .HasForeignKey(u => u.NiveauId)
                .OnDelete(DeleteBehavior.SetNull);

            // =========================
            // SEANCE COURS
            // =========================
            modelBuilder.Entity<SeanceCours>()
                .HasOne(s => s.Professeur)
                .WithMany(u => u.SeancesAnimees)
                .HasForeignKey(s => s.ProfesseurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SeanceCours>()
                .HasOne(s => s.Niveau)
                .WithMany(n => n.Seances)
                .HasForeignKey(s => s.NiveauId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SeanceCours>(entity =>
            {
                entity.Property(e => e.DateDebutAnnee)
                    .HasColumnType("timestamp without time zone");

                entity.Property(e => e.DateFinAnnee)
                    .HasColumnType("timestamp without time zone");
            });

            // =========================
            // EVENEMENT & RESERVATION
            // =========================
            modelBuilder.Entity<Evenement>()
                .HasOne(e => e.Organisateur)
                .WithMany(u => u.EvenementsOrganises)
                .HasForeignKey(e => e.OrganisateurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Utilisateur)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UtilisateurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Evenement)
                .WithMany(e => e.Reservations)
                .HasForeignKey(r => r.EvenementId)
                .OnDelete(DeleteBehavior.Cascade);

            // =========================
            // EXCEPTION PLANNING
            // =========================
            modelBuilder.Entity<ExceptionPlanning>()
                .HasOne(e => e.SeanceOriginale)
                .WithMany(s => s.Exceptions)
                .HasForeignKey(e => e.SeanceCoursId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExceptionPlanning>(entity =>
            {
                entity.Property(e => e.DateDebut)
                    .HasColumnType("timestamp without time zone");

                entity.Property(e => e.DateFin)
                    .HasColumnType("timestamp without time zone");

                entity.Property(e => e.TypeException)
                    .HasMaxLength(50);
            });

            // =========================
            // NOTIFICATION
            // =========================
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("Notifications");

                entity.HasKey(n => n.Id);

                entity.HasIndex(n => n.UtilisateurId)
                    .HasDatabaseName("IX_Notifications_UtilisateurId");

                entity.HasIndex(n => new { n.UtilisateurId, n.DateEnvoi })
                    .HasDatabaseName("IX_Notifications_UtilisateurId_DateEnvoi");

                entity.Property(n => n.Message)
                    .IsRequired()
                    .HasColumnType("text");

                entity.Property(n => n.DateEnvoi)
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("now()");

                entity.HasOne(n => n.Utilisateur)
                    .WithMany()
                    .HasForeignKey(n => n.UtilisateurId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            // =========================
            // DEMANDE ECHANGE
            // =========================
            modelBuilder.Entity<DemandeEchange>()
                .HasOne(d => d.Demandeur)
                .WithMany()
                .HasForeignKey(d => d.DemandeurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DemandeEchange>()
                .HasOne(d => d.Cible)
                .WithMany()
                .HasForeignKey(d => d.CibleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DemandeEchange>()
                .HasOne(d => d.SeanceDemandeur)
                .WithMany()
                .HasForeignKey(d => d.SeanceDemandeurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DemandeEchange>()
                .HasOne(d => d.SeanceCible)
                .WithMany()
                .HasForeignKey(d => d.SeanceCibleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DemandeEchange>()
                .Property(d => d.DateDemande)
                .HasColumnType("timestamp without time zone");

            modelBuilder.Entity<DemandeEchange>()
                .Property(d => d.DateReponse)
                .HasColumnType("timestamp without time zone");

            // =========================
            // IMPREVU ADMIN (audit)
            // =========================
            modelBuilder.Entity<ImprevuAdmin>(entity =>
            {
                entity.ToTable("ImprevusAdmin");
                entity.HasKey(i => i.Id);

                entity.Property(i => i.TypeAction).HasMaxLength(50).IsRequired();
                entity.Property(i => i.Motif).HasColumnType("text");

                entity.Property(i => i.DateAction)
                    .HasColumnType("timestamp without time zone");
                entity.Property(i => i.DateDebut)
                    .HasColumnType("timestamp without time zone");
                entity.Property(i => i.DateFin)
                    .HasColumnType("timestamp without time zone");

                // FK vers SeanceCours
                entity.HasOne(i => i.SeanceCours)
                    .WithMany()
                    .HasForeignKey(i => i.SeanceCoursId)
                    .OnDelete(DeleteBehavior.Cascade);

                // FK vers Admin (Utilisateur)
                entity.HasOne(i => i.Admin)
                    .WithMany()
                    .HasForeignKey(i => i.AdminId)
                    .OnDelete(DeleteBehavior.Restrict);

                // FK vers nouvelle salle (optionnel)
                entity.HasOne(i => i.NouvelleSalle)
                    .WithMany()
                    .HasForeignKey(i => i.NouvelleSalleId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .IsRequired(false);

                // Index pour requêtes fréquentes sur la date
                entity.HasIndex(i => i.DateAction)
                    .HasDatabaseName("IX_ImprevusAdmin_DateAction");
            });
        }
    }
}
