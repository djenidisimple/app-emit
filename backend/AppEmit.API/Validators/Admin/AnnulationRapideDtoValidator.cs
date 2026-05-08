// Validators/Admin/AnnulationRapideDtoValidator.cs
using AppEmit.API.DTOs.Admin;
using FluentValidation;

namespace AppEmit.API.Validators.Admin;

public class AnnulationRapideDtoValidator : AbstractValidator<AnnulationRapideDto>
{
    public AnnulationRapideDtoValidator()
    {
        RuleFor(x => x.SeanceCoursId).GreaterThan(0)
            .WithMessage("La séance est obligatoire.");

        RuleFor(x => x.DateOccurrence).GreaterThan(DateTime.UtcNow.AddMinutes(-30))
            .WithMessage("Impossible d'annuler une séance déjà passée depuis plus de 30 minutes.");

        RuleFor(x => x.AdminId).GreaterThan(0)
            .WithMessage("L'identifiant administrateur est obligatoire.");

        RuleFor(x => x.Motif).MaximumLength(500)
            .WithMessage("Le motif ne peut pas dépasser 500 caractères.");
    }
}

