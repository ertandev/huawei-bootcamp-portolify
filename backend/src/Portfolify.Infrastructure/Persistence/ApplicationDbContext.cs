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

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<DeveloperProfile> DeveloperProfiles => Set<DeveloperProfile>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<SkillEndorsement> SkillEndorsements => Set<SkillEndorsement>();
    public DbSet<Follower> Followers => Set<Follower>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global Query Filter for Multi-Tenancy
        modelBuilder.Entity<DeveloperProfile>().HasQueryFilter(p => !_currentUserService.TenantId.HasValue || p.TenantId == _currentUserService.TenantId);
        modelBuilder.Entity<Project>().HasQueryFilter(p => !_currentUserService.TenantId.HasValue || p.TenantId == _currentUserService.TenantId);
        modelBuilder.Entity<SocialLink>().HasQueryFilter(p => !_currentUserService.TenantId.HasValue || p.TenantId == _currentUserService.TenantId);
        modelBuilder.Entity<Skill>().HasQueryFilter(p => !_currentUserService.TenantId.HasValue || p.TenantId == _currentUserService.TenantId);
        modelBuilder.Entity<SkillEndorsement>().HasQueryFilter(p => !_currentUserService.TenantId.HasValue || p.TenantId == _currentUserService.TenantId);
        modelBuilder.Entity<User>().HasQueryFilter(u => !_currentUserService.TenantId.HasValue || u.TenantId == _currentUserService.TenantId);

        // Configure relations
        modelBuilder.Entity<Follower>(entity =>
        {
            entity.HasKey(f => f.Id);

            entity.HasOne(f => f.FollowerProfile)
                .WithMany(p => p.Following)
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.FollowedProfile)
                .WithMany(p => p.Followers)
                .HasForeignKey(f => f.FollowedId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SkillEndorsement>(entity =>
        {
            entity.HasOne(e => e.EndorsedBy)
                .WithMany()
                .HasForeignKey(e => e.EndorsedById)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentTenantId = _currentUserService.TenantId;
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

            if (entry.Entity is IMustHaveTenant tenantEntity)
            {
                if (entry.State == EntityState.Added)
                {
                    if (tenantEntity.TenantId == Guid.Empty)
                    {
                        if (currentTenantId.HasValue)
                        {
                            tenantEntity.TenantId = currentTenantId.Value;
                        }
                        else
                        {
                            throw new InvalidOperationException("Tenant context is required to save tenant-specific data.");
                        }
                    }
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
