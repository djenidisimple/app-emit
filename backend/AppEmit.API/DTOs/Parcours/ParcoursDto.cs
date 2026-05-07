namespace AppEmit.DTOs.Parcours;

public class ParcoursDto
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public int FiliereId { get; set; }
    public string FiliereNom { get; set; } = string.Empty;
}