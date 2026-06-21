using FluentValidation;
using MediatR;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Experiences.Commands;

public record CreateExperienceCommand : IRequest<Guid>
{
    public Guid DeveloperProfileId { get; init; }
    public string Company { get; init; } = null!;
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Description { get; init; }
    public string? Location { get; init; }
    public int DisplayOrder { get; init; }
}

public class CreateExperienceCommandValidator : AbstractValidator<CreateExperienceCommand>
{
    public CreateExperienceCommandValidator()
    {
        RuleFor(x => x.Company).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DeveloperProfileId).NotEmpty();
        RuleFor(x => x.StartDate).NotEmpty();
    }
}

public class CreateExperienceCommandHandler : IRequestHandler<CreateExperienceCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateExperienceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateExperienceCommand request, CancellationToken cancellationToken)
    {
        var experience = new Experience
        {
            DeveloperProfileId = request.DeveloperProfileId,
            Company = request.Company,
            Title = request.Title,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Description = request.Description,
            Location = request.Location,
            DisplayOrder = request.DisplayOrder
        };

        _context.Experiences.Add(experience);
        await _context.SaveChangesAsync(cancellationToken);

        return experience.Id;
    }
}
