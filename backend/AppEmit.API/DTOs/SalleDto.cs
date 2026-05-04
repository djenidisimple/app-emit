namespace AppEmit.DTOs
{
    public class SalleDto
    {
        public int Id { get; set; }
        public string CodeSalle { get; set; } = string.Empty;
        public string Libelle { get; set; } = string.Empty;
        public int Capacite { get; set; }
        public string? Equipements { get; set; }
        public bool EstActive { get; set; }
    }
}