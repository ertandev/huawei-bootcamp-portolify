using Microsoft.EntityFrameworkCore;
using Portfolify.Domain.Entities;

namespace Portfolify.Infrastructure.Persistence;

public static class ApplicationDbContextSeed
{
    public static async Task SeedSampleDataAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Tenants.AnyAsync())
        {
            var tenant1 = new Tenant
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "v0rteX Devs",
                Identifier = "vortex",
                IsActive = true
            };

            var tenant2 = new Tenant
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "John Doe Inc",
                Identifier = "johndoe",
                IsActive = true
            };

            context.Tenants.AddRange(tenant1, tenant2);
            await context.SaveChangesAsync();

            var profile1 = new DeveloperProfile
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                TenantId = tenant1.Id,
                FullName = "v0rteX Software Engineer",
                Title = "Senior Backend Architect",
                Bio = "Passionate about .NET 9, Clean Architecture, and microservices in PostgreSQL ecosystems. King of backend setups.",
                Email = "vortex@portfolify.com",
                AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
                BlogUrl = "https://blog.vortex.dev"
            };

            var profile2 = new DeveloperProfile
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                TenantId = tenant2.Id,
                FullName = "John Doe",
                Title = "Full Stack Engineer",
                Bio = "Building elegant mobile cards and SaaS platforms. Tech enthusiast, gamer, open-source contributor.",
                Email = "john.doe@portfolify.com",
                AvatarUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
            };

            context.DeveloperProfiles.AddRange(profile1, profile2);
            await context.SaveChangesAsync();

            var project1 = new Project
            {
                TenantId = tenant1.Id,
                DeveloperProfileId = profile1.Id,
                Title = "Portfolify Backend Engine",
                Description = "Clean Architecture, CQRS (MediatR), and multi-tenant SaaS backend foundation.",
                GithubUrl = "https://github.com/vortex/portfolify-backend",
                ProjectUrl = "https://api.portfolify.com",
                DisplayOrder = 1,
                IsFeatured = true
            };

            var project2 = new Project
            {
                TenantId = tenant1.Id,
                DeveloperProfileId = profile1.Id,
                Title = "Antigravity IDE Assistant",
                Description = "A highly intelligent, agentic coding assistant automating multi-layer architectural migrations.",
                DisplayOrder = 2,
                IsFeatured = true
            };

            context.Projects.AddRange(project1, project2);

            var link1 = new SocialLink
            {
                TenantId = tenant1.Id,
                DeveloperProfileId = profile1.Id,
                PlatformName = "GitHub",
                Url = "https://github.com/vortex",
                IconName = "github-icon"
            };

            var link2 = new SocialLink
            {
                TenantId = tenant1.Id,
                DeveloperProfileId = profile1.Id,
                PlatformName = "LinkedIn",
                Url = "https://linkedin.com/in/vortex-dev",
                IconName = "linkedin-icon"
            };

            context.SocialLinks.AddRange(link1, link2);

            var skill1 = new Skill
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                TenantId = tenant1.Id,
                DeveloperProfileId = profile1.Id,
                Name = ".NET 9 / ASP.NET Core",
                ProficiencyLevel = 95,
                DisplayOrder = 1
            };

            var skill2 = new Skill
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                TenantId = tenant1.Id,
                DeveloperProfileId = profile1.Id,
                Name = "PostgreSQL",
                ProficiencyLevel = 90,
                DisplayOrder = 2
            };

            context.Skills.AddRange(skill1, skill2);
            await context.SaveChangesAsync();

            var endorsement = new SkillEndorsement
            {
                TenantId = tenant1.Id,
                SkillId = skill1.Id,
                EndorsedById = profile2.Id,
                Comment = "Absolutely brilliant at Clean Architecture and C# optimizations!"
            };

            context.SkillEndorsements.Add(endorsement);

            var follower = new Follower
            {
                FollowerId = profile2.Id,
                FollowedId = profile1.Id
            };

            context.Followers.Add(follower);

            await context.SaveChangesAsync();
        }
    }
}
