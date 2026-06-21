using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Application.Features.DeveloperProfiles.DTOs;

namespace Portfolify.Application.Features.DeveloperProfiles.Queries;

public record GetDeveloperProfileQuery : IRequest<DeveloperProfileDto?>
{
    public Guid Id { get; init; }
}

public class GetDeveloperProfileQueryHandler : IRequestHandler<GetDeveloperProfileQuery, DeveloperProfileDto?>
{
    private readonly IApplicationDbContext _context;

    public GetDeveloperProfileQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeveloperProfileDto?> Handle(GetDeveloperProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await _context.DeveloperProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (profile == null)
            return null;

        return new DeveloperProfileDto
        {
            Id = profile.Id,
            TenantId = profile.TenantId,
            FullName = profile.FullName,
            Title = profile.Title,
            Bio = profile.Bio,
            AvatarUrl = profile.AvatarUrl,
            ResumeUrl = profile.ResumeUrl,
            BlogUrl = profile.BlogUrl,
            Email = profile.Email
        };
    }
}
