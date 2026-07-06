namespace AppEmit.API.DTOs.DemandeEchange
{
    public class DemandeEchangeReadDto
    {
        public int Id { get; set; }
        public int DemandeurId { get; set; }
        public string NomDemandeur { get; set; } = string.Empty;
        public int CibleId { get; set; }
        public string NomCible { get; set; } = string.Empty;
        public int SeanceDemandeurId { get; set; }
        public string SeanceDemandeurMatiere { get; set; } = string.Empty;
        public int SeanceCibleId { get; set; }
        public string SeanceCibleMatiere { get; set; } = string.Empty;
        public string Statut { get; set; } = string.Empty;
        public string? Motif { get; set; }
        public DateTime DateDemande { get; set; }
        public DateTime? DateReponse { get; set; }
    }
}