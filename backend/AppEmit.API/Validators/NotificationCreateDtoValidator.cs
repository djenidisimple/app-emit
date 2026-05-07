using AppEmit.API.DTOs.Notification;
using FluentValidation;

namespace AppEmit.API.Validators;

public class NotificationCreateDtoValidator : AbstractValidator<NotificationCreateDto>
{
    public NotificationCreateDtoValidator()
    {
        RuleFor(x => x.UtilisateurId)
            .GreaterThan(0)
            .WithMessage("L'identifiant utilisateur doit être supérieur à 0.");

        RuleFor(x => x.Message)
            .NotEmpty()
            .WithMessage("Le message ne peut pas être vide.")
            .MaximumLength(1000)
            .WithMessage("Le message ne peut pas dépasser 1000 caractères.");
    }
}