using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Utilisateur
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Email { get; set; } // UNIQUE
        public string Role { get; set; }
        public string Matricule { get; set; }
        public int? NiveauId { get; set; }
        public virtual Niveau Niveau { get; set; }
        public virtual ICollection<EvenementReservation> EvenementReservations { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<SeanceCours> Seances { get; set; }
    }
}