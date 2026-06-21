using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class Education : BaseEntity
{
    public Guid DeveloperProfileId { get; set; }
    public DeveloperProfile DeveloperProfile { get; set; } = null!;
    
    public string School { get; set; } = null!;
    public string Degree { get; set; } = null!;
    public string FieldOfStudy { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
}
