namespace AppEmit.API.DTOs.Matiere;

public class MatiereCreateDto
{
    public string Code { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string? Type { get; set; }
}
