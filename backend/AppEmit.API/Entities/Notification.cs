using System;
using System.Collections.Generic;

namespace AppEmit.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public string Message { get; set; }
        public DateTime DateEnvoi { get; set; }
        public bool EstLu { get; set; }
        public virtual Utilisateur Utilisateur { get; set; }
    }
}