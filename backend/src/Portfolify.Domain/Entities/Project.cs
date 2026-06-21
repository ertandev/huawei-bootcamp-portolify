using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class Project : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public Guid DeveloperProfileId { get; set; }
    public DeveloperProfile DeveloperProfile { get; set; } = null!;
    
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ProjectUrl { get; set; } // Demo link
    public string? GithubUrl { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
}
