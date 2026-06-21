using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Skills.Commands;

public record DeleteSkillCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}

public class DeleteSkillCommandHandler : IRequestHandler<DeleteSkillCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteSkillCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteSkillCommand request, CancellationToken cancellationToken)
    {
        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (skill == null)
            throw new KeyNotFoundException($"Skill '{request.Id}' was not found.");

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
