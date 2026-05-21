public class DemandeEchange
{
    public Guid Id { get; set; }                    // Clé primaire GUID
    public int SeanceCoursId { get; set; }          // FK vers la séance à échanger
    public int ProfesseurDemandeurId { get; set; }  // FK vers Utilisateur (celui qui demande)
    public int ProfesseurCibleId { get; set; }      // FK vers Utilisateur (le professeur cible)
    public string Statut { get; set; }              // "En attente" / "Acceptée" / "Refusée"
    public DateTime DateDemande { get; set; }       // Date de la demande
    
    // Navigations
    public virtual SeanceCours SeanceCours { get; set; } = null!;
    public virtual Utilisateur ProfesseurDemandeur { get; set; } = null!;
    public virtual Utilisateur ProfesseurCible { get; set; } = null!;
}