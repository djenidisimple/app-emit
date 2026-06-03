using AppEmit.API.DTOs.Auth;
using FluentValidation;

namespace AppEmit.API.Validators;

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email est requis.")
            .EmailAddress().WithMessage("Format d'email invalide.")
            .MaximumLength(150);

        RuleFor(x => x.MotDePasse)
            .NotEmpty().WithMessage("Le mot de passe est requis.");
    }
}

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Nom)
            .NotEmpty().WithMessage("Le nom est requis.")
            .MaximumLength(100);

        RuleFor(x => x.Prenom)
            .NotEmpty().WithMessage("Le prénom est requis.")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email est requis.")
            .EmailAddress().WithMessage("Format d'email invalide.")
            .MaximumLength(150);

        RuleFor(x => x.MotDePasse)
            .NotEmpty().WithMessage("Le mot de passe est requis.")
            .MinimumLength(8).WithMessage("Le mot de passe doit contenir au moins 8 caractères.")
            .Matches(@"[A-Z]").WithMessage("Le mot de passe doit contenir au moins une majuscule.")
            .Matches(@"[a-z]").WithMessage("Le mot de passe doit contenir au moins une minuscule.")
            .Matches(@"\d").WithMessage("Le mot de passe doit contenir au moins un chiffre.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Le rôle est requis.");
    }
}
