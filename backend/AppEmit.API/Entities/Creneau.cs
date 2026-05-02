using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Creneau
    {
        public int Id { get; set; }
        public string Jour { get; set; }
        public TimeSpan HeureDebut { get; set; }
        public TimeSpan HeureFin { get; set; }
        public virtual ICollection<SeanceCours> Seances { get; set; }
    }
}