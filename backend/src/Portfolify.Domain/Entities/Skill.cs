using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class Skill : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    
    public Guid DeveloperProfileId { get; set; }
    public DeveloperProfile DeveloperProfile { get; set; } = null!;
    
    public string Name { get; set; } = null!; // e.g. .NET Core, React, PostgreSQL
    public int ProficiencyLevel { get; set; } // e.g., 1-5 or 0-100 percentage
    public int DisplayOrder { get; set; }
    
    public ICollection<SkillEndorsement> Endorsements { get; set; } = new List<SkillEndorsement>();
}
