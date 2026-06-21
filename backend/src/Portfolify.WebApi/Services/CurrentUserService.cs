using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.WebApi.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public Guid? TenantId
    {
        get
        {
            var tenantIdObj = _httpContextAccessor.HttpContext?.Items["TenantId"];
            if (tenantIdObj is Guid tenantId)
            {
                return tenantId;
            }
            return null;
        }
    }
}
