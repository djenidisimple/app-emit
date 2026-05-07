namespace AppEmit.API.DTOs.Notification;

public class NotificationReadDto
{
    public int Id { get; set; }
    public int UtilisateurId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime DateEnvoi { get; set; }
    public bool EstLu { get; set; }
}