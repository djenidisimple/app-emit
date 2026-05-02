using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class ExceptionPlanning
    {
        public int Id { get; set; }
        public int SeanceCoursId { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
        public string TypeException { get; set; }
        public string Motif { get; set; }
        public int? NouvelleSalleId { get; set; }
        public virtual SeanceCours SeanceCours { get; set; }
        public virtual Salle NouvelleSalle { get; set; }
    }
}