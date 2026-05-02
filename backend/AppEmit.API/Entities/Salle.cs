using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Salle
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public int Capacite { get; set; }
        public string Type { get; set; }
        public bool EstDisponible { get; set; }
        public virtual ICollection<SeanceCours> Seances { get; set; }
    }
}