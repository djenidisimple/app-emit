namespace AppEmit.API.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Nom { get; set; } = string.Empty;
        public string Prenom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public string? Matricule { get; set; }
        public int? NiveauId { get; set; }
        public DateTime Expiration { get; set; }
    }
}
