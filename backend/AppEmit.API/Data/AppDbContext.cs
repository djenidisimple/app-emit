using Microsoft.EntityFrameworkCore;
using AppEmit.Entities;

namespace AppEmit.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

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

            // Email unique
            modelBuilder.Entity<Utilisateur>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Professeur -> SeancesCours (restrict delete)
            modelBuilder.Entity<SeanceCours>()
                .HasOne(s => s.Professeur)
                .WithMany(u => u.SeancesAnimees)
                .HasForeignKey(s => s.ProfesseurId)
                .OnDelete(DeleteBehavior.Restrict);

            // Demandeur -> EvenementReservation (restrict delete)
            modelBuilder.Entity<EvenementReservation>()
                .HasOne(r => r.Demandeur)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.DemandeurId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relation ExceptionPlanning -> SeanceCours (SeanceOriginale)
            modelBuilder.Entity<ExceptionPlanning>()
                .HasOne(e => e.SeanceOriginale)
                .WithMany(s => s.Exceptions)
                .HasForeignKey(e => e.SeanceCoursId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuration des types DateTime pour éviter l'erreur "timestamp with time zone"
            modelBuilder.Entity<SeanceCours>(entity =>
            {
                entity.Property(e => e.DateDebutAnnee)
                    .HasColumnType("timestamp without time zone");
                entity.Property(e => e.DateFinAnnee)
                    .HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<ExceptionPlanning>(entity =>
            {
                entity.Property(e => e.DateDebut)
                    .HasColumnType("timestamp without time zone");
                entity.Property(e => e.DateFin)
                    .HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<EvenementReservation>(entity =>
            {
                entity.Property(e => e.DatePrecise)
                    .HasColumnType("timestamp without time zone");
            });

            // Longueur maximale pour TypeException
            modelBuilder.Entity<ExceptionPlanning>()
                .Property(e => e.TypeException)
                .HasMaxLength(50);
        }
    }
}