using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Experiences.Commands;

public record DeleteExperienceCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}

public class DeleteExperienceCommandHandler : IRequestHandler<DeleteExperienceCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteExperienceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteExperienceCommand request, CancellationToken cancellationToken)
    {
        var experience = await _context.Experiences
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (experience == null)
            throw new KeyNotFoundException($"Experience '{request.Id}' was not found.");

        _context.Experiences.Remove(experience);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
