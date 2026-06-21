using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class Follower : BaseEntity
{
    public Guid FollowerId { get; set; } // The DeveloperProfile of the follower
    public DeveloperProfile FollowerProfile { get; set; } = null!;
    
    public Guid FollowedId { get; set; } // The DeveloperProfile of the followed person
    public DeveloperProfile FollowedProfile { get; set; } = null!;
}
