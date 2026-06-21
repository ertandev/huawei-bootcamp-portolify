using Microsoft.EntityFrameworkCore;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<DeveloperProfile> DeveloperProfiles { get; }
    DbSet<Project> Projects { get; }
    DbSet<SocialLink> SocialLinks { get; }
    DbSet<Skill> Skills { get; }
    DbSet<SkillEndorsement> SkillEndorsements { get; }
    DbSet<Follower> Followers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
