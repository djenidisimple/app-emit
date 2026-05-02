using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Parcours
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public int FiliereId { get; set; }
        public virtual Filiere Filiere { get; set; }
    }
}