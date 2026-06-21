using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Common;
using Portfolify.Domain.Entities;

namespace Portfolify.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUserService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<DeveloperProfile> DeveloperProfiles => Set<DeveloperProfile>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<SkillEndorsement> SkillEndorsements => Set<SkillEndorsement>();
    public DbSet<Experience> Experiences => Set<Experience>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<Follower> Followers => Set<Follower>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique index on User.Username
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Configure 1-to-1 relationship between User and DeveloperProfile
        modelBuilder.Entity<DeveloperProfile>()
            .HasOne(p => p.User)
            .WithOne(u => u.DeveloperProfile)
            .HasForeignKey<DeveloperProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure relations
        modelBuilder.Entity<Follower>(entity =>
        {
            entity.HasKey(f => f.Id);

            entity.HasOne(f => f.FollowerProfile)
                .WithMany(p => p.Following)
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.FollowedProfile)
                .WithMany(p => p.Followers)
                .HasForeignKey(f => f.FollowedId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SkillEndorsement>(entity =>
        {
            entity.HasOne(e => e.EndorsedBy)
                .WithMany()
                .HasForeignKey(e => e.EndorsedById)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Experience>(entity =>
        {
            entity.HasOne(e => e.DeveloperProfile)
                .WithMany(p => p.Experiences)
                .HasForeignKey(e => e.DeveloperProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Education>(entity =>
        {
            entity.HasOne(e => e.DeveloperProfile)
                .WithMany(p => p.Educations)
                .HasForeignKey(e => e.DeveloperProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId ?? "System";

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is BaseEntity baseEntity)
            {
                if (entry.State == EntityState.Added)
                {
                    baseEntity.CreatedAt = DateTime.UtcNow;
                    baseEntity.CreatedBy = currentUserId;
                }
                else if (entry.State == EntityState.Modified)
                {
                    baseEntity.LastModifiedAt = DateTime.UtcNow;
                    baseEntity.LastModifiedBy = currentUserId;
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
