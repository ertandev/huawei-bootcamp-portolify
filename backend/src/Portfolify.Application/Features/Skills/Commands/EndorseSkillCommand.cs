using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Skills.Commands;

public record EndorseSkillCommand : IRequest<Guid>
{
    public Guid SkillId { get; init; }
    public Guid EndorsedById { get; init; }
    public string? Comment { get; init; }
}

public class EndorseSkillCommandValidator : AbstractValidator<EndorseSkillCommand>
{
    public EndorseSkillCommandValidator()
    {
        RuleFor(x => x.SkillId).NotEmpty();
        RuleFor(x => x.EndorsedById).NotEmpty();
        RuleFor(x => x.Comment).MaximumLength(250);
    }
}

public class EndorseSkillCommandHandler : IRequestHandler<EndorseSkillCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public EndorseSkillCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(EndorseSkillCommand request, CancellationToken cancellationToken)
    {
        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == request.SkillId, cancellationToken);

        if (skill == null)
            throw new KeyNotFoundException($"Skill '{request.SkillId}' was not found.");

        var endorser = await _context.DeveloperProfiles
            .IgnoreQueryFilters() // Endorser could be from a different tenant
            .FirstOrDefaultAsync(p => p.Id == request.EndorsedById, cancellationToken);

        if (endorser == null)
            throw new KeyNotFoundException($"Endorser Profile '{request.EndorsedById}' was not found.");

        var alreadyEndorsed = await _context.SkillEndorsements
            .AnyAsync(e => e.SkillId == request.SkillId && e.EndorsedById == request.EndorsedById, cancellationToken);

        if (alreadyEndorsed)
            throw new InvalidOperationException("You have already endorsed this skill.");

        var endorsement = new SkillEndorsement
        {
            SkillId = request.SkillId,
            EndorsedById = request.EndorsedById,
            Comment = request.Comment,
            TenantId = skill.TenantId
        };

        _context.SkillEndorsements.Add(endorsement);
        await _context.SaveChangesAsync(cancellationToken);

        return endorsement.Id;
    }
}
