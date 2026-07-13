namespace AppEmit.API.DTOs.Hierarchy;

public class FiliereHierarchyDto
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<ParcoursHierarchyDto> Parcours { get; set; } = new();
}

public class ParcoursHierarchyDto
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<NiveauHierarchyDto> Niveaux { get; set; } = new();
}

public class NiveauHierarchyDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public List<MatiereHierarchyDto> Matieres { get; set; } = new();
}

public class MatiereHierarchyDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Type { get; set; }
}
