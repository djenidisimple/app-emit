using Microsoft.EntityFrameworkCore;
using AppEmit.Entities;

namespace AppEmit.Data
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
        public DbSet<EvenementReservation> EvenementReservations { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ExceptionPlanning> ExceptionsPlanning { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =========================
            // UTILISATEUR
            // =========================
            modelBuilder.Entity<Utilisateur>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // =========================
            // SEANCE COURS
            // =========================
            modelBuilder.Entity<SeanceCours>()
                .HasOne(s => s.Professeur)
                .WithMany(u => u.SeancesAnimees)
                .HasForeignKey(s => s.ProfesseurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SeanceCours>(entity =>
            {
                entity.Property(e => e.DateDebutAnnee)
                    .HasColumnType("timestamp without time zone");

                entity.Property(e => e.DateFinAnnee)
                    .HasColumnType("timestamp without time zone");
            });

            // =========================
            // RESERVATION
            // =========================
            modelBuilder.Entity<EvenementReservation>()
                .HasOne(r => r.Demandeur)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.DemandeurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EvenementReservation>(entity =>
            {
                entity.Property(e => e.DatePrecise)
                    .HasColumnType("timestamp without time zone");
            });

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
        }
    }
}