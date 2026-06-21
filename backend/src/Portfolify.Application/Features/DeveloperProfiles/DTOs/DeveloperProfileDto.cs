namespace Portfolify.Application.Features.DeveloperProfiles.DTOs;

public class DeveloperProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? ResumeUrl { get; set; }
    public string? BlogUrl { get; set; }
    public string Email { get; set; } = null!;
}
