using Microsoft.EntityFrameworkCore;
using AppEmit.Entities;

namespace AppEmit.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Liste des tables
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

            // Contrainte d'email unique
            modelBuilder.Entity<Utilisateur>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configuration de la relation Professeur -> SeanceCours
            // Note : On utilise "ProfesseurId" car c'est le nom dans l'entité SeanceCours
            modelBuilder.Entity<SeanceCours>()
                .HasOne(s => s.Professeur)
                .WithMany(u => u.SeancesAnimees)
                .HasForeignKey(s => s.ProfesseurId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuration pour éviter les cycles de suppression sur les réservations
            modelBuilder.Entity<EvenementReservation>()
                .HasOne(r => r.Demandeur)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.DemandeurId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(n => n.Id);
            entity.HasIndex(n => n.UtilisateurId).HasDatabaseName("IX_Notifications_UtilisateurId");
            entity.HasIndex(n => new { n.UtilisateurId, n.DateEnvoi }).HasDatabaseName("IX_Notifications_UtilisateurId_DateEnvoi");
            entity.Property(n => n.Message).IsRequired().HasColumnType("text");
            entity.Property(n => n.DateEnvoi).HasColumnType("timestamp with time zone").HasDefaultValueSql("now()");
            entity.HasOne(n => n.Utilisateur)
                  .WithMany()
                  .HasForeignKey(n => n.UtilisateurId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        }
    }
}


