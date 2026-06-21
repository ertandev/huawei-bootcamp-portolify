using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class User : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = "User"; // e.g. Admin, User
}
