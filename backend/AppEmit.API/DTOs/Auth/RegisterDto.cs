using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.Auth
{
    public class RegisterDto
    {
        [Required] public string Nom { get; set; } = string.Empty;
        [Required] public string Prenom { get; set; } = string.Empty;
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required][MinLength(6)] public string MotDePasse { get; set; } = string.Empty;
        [Required] public string Role { get; set; } = "Etudiant";
        [Required] public string Matricule { get; set; } = string.Empty;
    }
}
