using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Experiences.Commands;

public record UpdateExperienceCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public string Company { get; init; } = null!;
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Description { get; init; }
    public string? Location { get; init; }
    public int DisplayOrder { get; init; }
}

public class UpdateExperienceCommandValidator : AbstractValidator<UpdateExperienceCommand>
{
    public UpdateExperienceCommandValidator()
    {
        RuleFor(x => x.Company).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.StartDate).NotEmpty();
    }
}

public class UpdateExperienceCommandHandler : IRequestHandler<UpdateExperienceCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateExperienceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateExperienceCommand request, CancellationToken cancellationToken)
    {
        var experience = await _context.Experiences
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (experience == null)
            throw new KeyNotFoundException($"Experience '{request.Id}' was not found.");

        experience.Company = request.Company;
        experience.Title = request.Title;
        experience.StartDate = request.StartDate;
        experience.EndDate = request.EndDate;
        experience.Description = request.Description;
        experience.Location = request.Location;
        experience.DisplayOrder = request.DisplayOrder;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
