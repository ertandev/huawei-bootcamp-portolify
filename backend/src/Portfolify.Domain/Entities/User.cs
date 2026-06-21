using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = "User"; // e.g. Admin, User
    
    public DeveloperProfile? DeveloperProfile { get; set; }
}
