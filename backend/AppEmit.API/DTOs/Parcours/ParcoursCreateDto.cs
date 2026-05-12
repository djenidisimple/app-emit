namespace AppEmit.API.DTOs.Parcours;

public class ParcoursCreateDto
{
    public string Nom { get; set; } = string.Empty;
    public int FiliereId { get; set; }
}
