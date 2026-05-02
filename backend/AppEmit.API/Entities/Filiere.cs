using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Filiere
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public virtual ICollection<Parcours> Parcours { get; set; } = new List<Parcours>();
    }
}