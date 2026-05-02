using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class EvenementReservation
    {
        public int Id { get; set; }
        public string Titre { get; set; }
        public string Type { get; set; }
        public DateTime DatePrecise { get; set; }
        public string Session { get; set; }
        public string Statut { get; set; }
        public int DemandeurId { get; set; }
        public int SalleId { get; set; }
        public virtual Utilisateur Demandeur { get; set; }
        public virtual Salle Salle { get; set; }
    }
}