namespace AppEmit.API.DTOs.SeanceCours
{
    public class SeanceCoursReadDto
    {
        public int Id { get; set; }
        public int MatiereId { get; set; }
        public int ProfId { get; set; }
        public int SalleId { get; set; }
        public int CreneauId { get; set; }
        public DateTime DateDebutAnnee { get; set; }
        public DateTime DateFinAnnee { get; set; }
        public bool EstTermine { get; set; }
        public string CouleurAffichage { get; set; } = string.Empty;
    }
}