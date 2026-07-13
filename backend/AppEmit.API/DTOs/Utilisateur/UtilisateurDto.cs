namespace AppEmit.API.DTOs.Utilisateur
{
    public class UtilisateurDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Matricule { get; set; }
        public string? Role { get; set; }
        public int? NiveauId { get; set; }
        public string? NiveauCode { get; set; }
    }

    public class UtilisateurCreateDto
    {
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? MotDePasse { get; set; }
        public string? Matricule { get; set; }
        public string? Role { get; set; }
        public int? NiveauId { get; set; }
    }

    public class UtilisateurCreatedDto : UtilisateurDto
    {
        public string? MotDePasse { get; set; }
    }

    public class UtilisateurUpdateDto
    {
        public string? Nom { get; set; }
        public string? Prenom { get; set; }
        public string? Email { get; set; }
        public string? Matricule { get; set; }
        public string? Role { get; set; }
        public int? NiveauId { get; set; }
    }
}
