using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class SeanceCours
    {
        public int Id { get; set; }
        public int MatiereId { get; set; }
        public int ProfId { get; set; }
        public int SalleId { get; set; }
        public int CreneauId { get; set; }
        public int NiveauId { get; set; }
        public DateTime DateDebutAnnee { get; set; }
        public DateTime DateFinAnnee { get; set; }
        public bool EstTermine { get; set; }
        public string CouleurAffichage { get; set; } 
        public virtual Matiere Matiere { get; set; }
        public virtual Utilisateur Prof { get; set; }
        public virtual Salle Salle { get; set; }
        public virtual Creneau Creneau { get; set; }
        public virtual Niveau Niveau { get; set; }
    }
}