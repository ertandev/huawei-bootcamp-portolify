using Portfolify.Domain.Entities;

namespace Portfolify.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, string tenantIdentifier);
}
