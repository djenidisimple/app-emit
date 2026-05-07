namespace AppEmit.DTOs.Salle
{
    public class SalleDetailsDto
    {
        public int Id { get; set; }
        public string CodeSalle { get; set; } = string.Empty;
        public string Libelle { get; set; } = string.Empty;
        public int Capacite { get; set; }
        public string? Equipements { get; set; }
        public bool EstActive { get; set; }
        public List<SeanceSimpleDto> Seances { get; set; } = new();
    }

    public class SeanceSimpleDto
    {
        public int Id { get; set; }
        public string MatiereNom { get; set; } = string.Empty;
        public string ProfesseurNom { get; set; } = string.Empty;
        public string Jour { get; set; } = string.Empty;
        public TimeSpan HeureDebut { get; set; }
        public TimeSpan HeureFin { get; set; }
    }
}