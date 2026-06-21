using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class SocialLink : BaseEntity
{
    public Guid DeveloperProfileId { get; set; }
    public DeveloperProfile DeveloperProfile { get; set; } = null!;
    
    public string PlatformName { get; set; } = null!; // e.g. GitHub, LinkedIn, Twitter, Medium
    public string Url { get; set; } = null!;
    public string? IconName { get; set; } // CSS icon class or component key
}
