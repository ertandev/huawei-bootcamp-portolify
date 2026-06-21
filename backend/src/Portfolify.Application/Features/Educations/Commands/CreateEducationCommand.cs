using FluentValidation;
using MediatR;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Educations.Commands;

public record CreateEducationCommand : IRequest<Guid>
{
    public Guid DeveloperProfileId { get; init; }
    public string School { get; init; } = null!;
    public string Degree { get; init; } = null!;
    public string FieldOfStudy { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
}

public class CreateEducationCommandValidator : AbstractValidator<CreateEducationCommand>
{
    public CreateEducationCommandValidator()
    {
        RuleFor(x => x.School).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Degree).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FieldOfStudy).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DeveloperProfileId).NotEmpty();
        RuleFor(x => x.StartDate).NotEmpty();
    }
}

public class CreateEducationCommandHandler : IRequestHandler<CreateEducationCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateEducationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateEducationCommand request, CancellationToken cancellationToken)
    {
        var education = new Education
        {
            DeveloperProfileId = request.DeveloperProfileId,
            School = request.School,
            Degree = request.Degree,
            FieldOfStudy = request.FieldOfStudy,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder
        };

        _context.Educations.Add(education);
        await _context.SaveChangesAsync(cancellationToken);

        return education.Id;
    }
}
