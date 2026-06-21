using Portfolify.Domain.Common;

namespace Portfolify.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Identifier { get; set; } = null!; // e.g., subdomain name 'john-doe'
    public bool IsActive { get; set; } = true;
    
    public ICollection<DeveloperProfile> DeveloperProfiles { get; set; } = new List<DeveloperProfile>();
}
