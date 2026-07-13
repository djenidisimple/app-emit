namespace AppEmit.API.DTOs.SeanceCours
{
    public class SeanceCoursUpdateDto
    {
        public int SalleId { get; set; }
        public int CreneauId { get; set; }
        public string CouleurAffichage { get; set; } = "#3B82F6";
        public bool EstTermine { get; set; }
        public TimeSpan? HeureDebutCustom { get; set; }
        public TimeSpan? HeureFinCustom { get; set; }
    }
}
