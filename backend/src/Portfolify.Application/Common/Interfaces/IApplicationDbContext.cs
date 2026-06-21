using Microsoft.EntityFrameworkCore;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<DeveloperProfile> DeveloperProfiles { get; }
    DbSet<Project> Projects { get; }
    DbSet<SocialLink> SocialLinks { get; }
    DbSet<Skill> Skills { get; }
    DbSet<SkillEndorsement> SkillEndorsements { get; }
    DbSet<Follower> Followers { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
