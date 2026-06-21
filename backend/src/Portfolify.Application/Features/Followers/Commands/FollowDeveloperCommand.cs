using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Followers.Commands;

public record FollowDeveloperCommand : IRequest<Guid>
{
    public Guid FollowerId { get; init; }
    public Guid FollowedId { get; init; }
}

public class FollowDeveloperCommandValidator : AbstractValidator<FollowDeveloperCommand>
{
    public FollowDeveloperCommandValidator()
    {
        RuleFor(x => x.FollowerId).NotEmpty();
        RuleFor(x => x.FollowedId).NotEmpty();
    }
}

public class FollowDeveloperCommandHandler : IRequestHandler<FollowDeveloperCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public FollowDeveloperCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(FollowDeveloperCommand request, CancellationToken cancellationToken)
    {
        if (request.FollowerId == request.FollowedId)
            throw new InvalidOperationException("You cannot follow yourself.");

        var followerExists = await _context.DeveloperProfiles
            .IgnoreQueryFilters()
            .AnyAsync(p => p.Id == request.FollowerId, cancellationToken);

        if (!followerExists)
            throw new KeyNotFoundException($"Follower profile '{request.FollowerId}' was not found.");

        var followedExists = await _context.DeveloperProfiles
            .IgnoreQueryFilters()
            .AnyAsync(p => p.Id == request.FollowedId, cancellationToken);

        if (!followedExists)
            throw new KeyNotFoundException($"Followed profile '{request.FollowedId}' was not found.");

        var alreadyFollowing = await _context.Followers
            .AnyAsync(f => f.FollowerId == request.FollowerId && f.FollowedId == request.FollowedId, cancellationToken);

        if (alreadyFollowing)
            throw new InvalidOperationException("You are already following this developer.");

        var follow = new Follower
        {
            FollowerId = request.FollowerId,
            FollowedId = request.FollowedId
        };

        _context.Followers.Add(follow);
        await _context.SaveChangesAsync(cancellationToken);

        return follow.Id;
    }
}
