using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class SkillEndorsement : BaseEntity
{
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
    
    public Guid EndorsedById { get; set; } // The DeveloperProfile id of the person who endorsed this skill
    public DeveloperProfile EndorsedBy { get; set; } = null!;
    
    public string? Comment { get; set; } // Optional short comment explaining the endorsement
}
