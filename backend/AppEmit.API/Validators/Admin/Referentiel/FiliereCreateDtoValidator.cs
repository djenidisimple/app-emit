// Validators/Admin/Referentiel/FiliereCreateDtoValidator.cs
using AppEmit.API.DTOs.Admin.Referentiel;
using FluentValidation;

namespace AppEmit.API.Validators.Admin.Referentiel;

public class FiliereCreateDtoValidator : AbstractValidator<FiliereCreateDto>
{
    public FiliereCreateDtoValidator()
    {
        RuleFor(x => x.Nom).NotEmpty().MaximumLength(100)
            .WithMessage("Le nom de la filière est obligatoire (max 100 caractères).");
    }
}

public class NiveauCreateDtoValidator : AbstractValidator<NiveauCreateDto>
{
    public NiveauCreateDtoValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(10);
        RuleFor(x => x.ParcoursId).GreaterThan(0);
    }
}