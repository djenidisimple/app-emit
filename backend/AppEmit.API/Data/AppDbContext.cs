using Microsoft.EntityFrameworkCore;
using AppEmit.Entities;

namespace AppEmit.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Liste des tables de la base de données
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

            // Configuration de la relation spécifique "ProfId" -> "Utilisateur"
            modelBuilder.Entity<SeanceCours>()
                .HasOne(s => s.Prof)
                .WithMany(u => u.Seances)
                .HasForeignKey(s => s.ProfId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}