using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Followers.Commands;

public record UnfollowDeveloperCommand : IRequest<Unit>
{
    public Guid FollowerId { get; init; }
    public Guid FollowedId { get; init; }
}

public class UnfollowDeveloperCommandHandler : IRequestHandler<UnfollowDeveloperCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UnfollowDeveloperCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UnfollowDeveloperCommand request, CancellationToken cancellationToken)
    {
        var followRelation = await _context.Followers
            .FirstOrDefaultAsync(f => f.FollowerId == request.FollowerId && f.FollowedId == request.FollowedId, cancellationToken);

        if (followRelation == null)
            throw new InvalidOperationException("You are not following this developer.");

        _context.Followers.Remove(followRelation);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
