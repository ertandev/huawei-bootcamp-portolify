using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class Experience : BaseEntity
{
    public Guid DeveloperProfileId { get; set; }
    public DeveloperProfile DeveloperProfile { get; set; } = null!;
    
    public string Company { get; set; } = null!;
    public string Title { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public int DisplayOrder { get; set; }
}
