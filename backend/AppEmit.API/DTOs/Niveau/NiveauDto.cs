namespace AppEmit.API.DTOs.Niveau
{
    public class NiveauDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public int ParcoursId { get; set; }
        public string? ParcoursNom { get; set; }
    }

    public class NiveauCreateDto
    {
        public string Code { get; set; } = string.Empty;
        public int ParcoursId { get; set; }
    }
}
