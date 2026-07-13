namespace AppEmit.API.DTOs.Filiere
{
    public class FiliereDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class FiliereCreateDto
    {
        public string Nom { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
