using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Matiere
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Code { get; set; }
        public virtual ICollection<SeanceCours> Seances { get; set; }
    }
}