using FluentValidation;
using MediatR;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Skills.Commands;

public record CreateSkillCommand : IRequest<Guid>
{
    public Guid DeveloperProfileId { get; init; }
    public string Name { get; init; } = null!;
    public int ProficiencyLevel { get; init; }
    public int DisplayOrder { get; init; }
}

public class CreateSkillCommandValidator : AbstractValidator<CreateSkillCommand>
{
    public CreateSkillCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DeveloperProfileId).NotEmpty();
        RuleFor(x => x.ProficiencyLevel).InclusiveBetween(0, 100);
    }
}

public class CreateSkillCommandHandler : IRequestHandler<CreateSkillCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateSkillCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSkillCommand request, CancellationToken cancellationToken)
    {
        var skill = new Skill
        {
            DeveloperProfileId = request.DeveloperProfileId,
            Name = request.Name,
            ProficiencyLevel = request.ProficiencyLevel,
            DisplayOrder = request.DisplayOrder
        };

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync(cancellationToken);

        return skill.Id;
    }
}
