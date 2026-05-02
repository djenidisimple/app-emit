using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Niveau
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public int ParcoursId { get; set; }
        public virtual ICollection<Utilisateur> Utilisateurs { get; set; }
        public virtual Parcours Parcours { get; set; }
        public virtual ICollection<SeanceCours> Seances { get; set; }
    }
}