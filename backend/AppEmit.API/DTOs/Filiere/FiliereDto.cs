namespace AppEmit.API.DTOs.Filiere
{
    public class FiliereDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
    }

    public class FiliereCreateDto
    {
        public string Nom { get; set; } = string.Empty;
    }
}
