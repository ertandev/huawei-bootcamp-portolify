using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.DeveloperProfiles.Queries;

public record GetDeveloperProfileDetailsQuery : IRequest<DeveloperProfileDetailsDto?>
{
    public string? Username { get; init; }
}

public class DeveloperProfileDetailsDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? ResumeUrl { get; set; }
    public string? BlogUrl { get; set; }
    public string Email { get; set; } = null!;
    
    public List<ProjectDto> Projects { get; set; } = new();
    public List<SocialLinkDto> SocialLinks { get; set; } = new();
    public List<SkillDto> Skills { get; set; } = new();
}

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ProjectUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
}

public class SocialLinkDto
{
    public Guid Id { get; set; }
    public string PlatformName { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? IconName { get; set; }
}

public class SkillDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public int ProficiencyLevel { get; set; }
    public int DisplayOrder { get; set; }
    public List<SkillEndorsementDto> Endorsements { get; set; } = new();
}

public class SkillEndorsementDto
{
    public Guid Id { get; set; }
    public Guid EndorsedById { get; set; }
    public string EndorsedByName { get; set; } = null!;
    public string? Comment { get; set; }
}

public class GetDeveloperProfileDetailsQueryHandler : IRequestHandler<GetDeveloperProfileDetailsQuery, DeveloperProfileDetailsDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetDeveloperProfileDetailsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<DeveloperProfileDetailsDto?> Handle(GetDeveloperProfileDetailsQuery request, CancellationToken cancellationToken)
    {
        DeveloperProfile? profile = null;

        if (!string.IsNullOrEmpty(request.Username))
        {
            profile = await _context.DeveloperProfiles
                .AsNoTracking()
                .Include(p => p.Projects)
                .Include(p => p.SocialLinks)
                .Include(p => p.Skills)
                    .ThenInclude(s => s.Endorsements)
                        .ThenInclude(e => e.EndorsedBy)
                .FirstOrDefaultAsync(p => p.User.Username == request.Username.ToLower(), cancellationToken);
        }
        else
        {
            var userIdStr = _currentUserService.UserId;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                profile = await _context.DeveloperProfiles
                    .AsNoTracking()
                    .Include(p => p.Projects)
                    .Include(p => p.SocialLinks)
                    .Include(p => p.Skills)
                        .ThenInclude(s => s.Endorsements)
                            .ThenInclude(e => e.EndorsedBy)
                    .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
            }
        }

        if (profile == null)
            return null;

        return new DeveloperProfileDetailsDto
        {
            Id = profile.Id,
            FullName = profile.FullName,
            Title = profile.Title,
            Bio = profile.Bio,
            AvatarUrl = profile.AvatarUrl,
            ResumeUrl = profile.ResumeUrl,
            BlogUrl = profile.BlogUrl,
            Email = profile.Email,
            Projects = profile.Projects
                .OrderBy(pr => pr.DisplayOrder)
                .Select(pr => new ProjectDto
                {
                    Id = pr.Id,
                    Title = pr.Title,
                    Description = pr.Description,
                    ProjectUrl = pr.ProjectUrl,
                    GithubUrl = pr.GithubUrl,
                    ImageUrl = pr.ImageUrl,
                    DisplayOrder = pr.DisplayOrder,
                    IsFeatured = pr.IsFeatured
                }).ToList(),
            SocialLinks = profile.SocialLinks
                .Select(sl => new SocialLinkDto
                {
                    Id = sl.Id,
                    PlatformName = sl.PlatformName,
                    Url = sl.Url,
                    IconName = sl.IconName
                }).ToList(),
            Skills = profile.Skills
                .OrderBy(sk => sk.DisplayOrder)
                .Select(sk => new SkillDto
                {
                    Id = sk.Id,
                    Name = sk.Name,
                    ProficiencyLevel = sk.ProficiencyLevel,
                    DisplayOrder = sk.DisplayOrder,
                    Endorsements = sk.Endorsements
                        .Select(e => new SkillEndorsementDto
                        {
                            Id = e.Id,
                            EndorsedById = e.EndorsedById,
                            EndorsedByName = e.EndorsedBy.FullName,
                            Comment = e.Comment
                        }).ToList()
                }).ToList()
        };
    }
}
