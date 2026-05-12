namespace AppEmit.API.DTOs.Notification;

public class NotificationCreateDto
{
    public int UtilisateurId { get; set; }
    public string Message { get; set; } = string.Empty;
}
