namespace AppEmit.API.DTOs.SeanceCours
{
    public class SeanceCoursCreateDto
    {
        public int MatiereId { get; set; }
        public int ProfId { get; set; }
        public int SalleId { get; set; }
        public int CreneauId { get; set; }
        public DateTime DateDebutAnnee { get; set; }
        public DateTime DateFinAnnee { get; set; }
        public string CouleurAffichage { get; set; } = "#3B82F6";
    }
}
