using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class DeveloperProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string FullName { get; set; } = null!;
    public string Title { get; set; } = null!; // e.g., Senior Full Stack Developer
    public string Bio { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? ResumeUrl { get; set; }
    public string? BlogUrl { get; set; }
    public string Email { get; set; } = null!;
    
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<SocialLink> SocialLinks { get; set; } = new List<SocialLink>();
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
    public ICollection<Follower> Followers { get; set; } = new List<Follower>(); // People following this developer
    public ICollection<Follower> Following { get; set; } = new List<Follower>(); // People this developer follows
}
