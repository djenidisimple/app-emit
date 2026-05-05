using System.ComponentModel.DataAnnotations;

namespace AppEmit.API.DTOs.Auth
{
    public class LoginDto
    {
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required] public string MotDePasse { get; set; } = string.Empty;
    }
}