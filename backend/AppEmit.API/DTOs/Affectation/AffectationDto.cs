namespace AppEmit.API.DTOs.Affectation;

public class AffectationDto
{
    public int Id { get; set; }
    public int ProfesseurId { get; set; }
    public string ProfesseurNom { get; set; } = string.Empty;
    public string ProfesseurPrenom { get; set; } = string.Empty;
    public int MatiereId { get; set; }
    public string MatiereNom { get; set; } = string.Empty;
    public string MatiereCode { get; set; } = string.Empty;
    public int? ParcoursId { get; set; }
    public string? ParcoursNom { get; set; }
    public int? NiveauId { get; set; }
    public string? NiveauCode { get; set; }
}

public class AffectationCreateDto
{
    public int ProfesseurId { get; set; }
    public int MatiereId { get; set; }
    public int? ParcoursId { get; set; }
    public int? NiveauId { get; set; }
}
