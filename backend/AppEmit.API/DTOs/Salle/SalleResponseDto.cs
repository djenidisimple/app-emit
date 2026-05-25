using AppEmit.API.Entities;
namespace AppEmit.API.DTOs.Salle
{
    public class SalleResponseDto
    {
        public int Id { get; set; }
        public string CodeSalle { get; set; } = string.Empty;
        public string Libelle { get; set; } = string.Empty;
        public string Nom { get; set; } = string.Empty;
        public int Capacite { get; set; }
        public string? Equipements { get; set; }
        public bool EstActive { get; set; }
        public bool EstDisponible { get; set; }
        public string? Type { get; set; }
        public int NombreSeances { get; set; }
        public string Statut => EstActive ? "Active" : "Désactivée";
    }
}
