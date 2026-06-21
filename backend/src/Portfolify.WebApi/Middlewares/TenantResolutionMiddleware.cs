using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.WebApi.Middlewares;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IApplicationDbContext dbContext)
    {
        string? tenantIdentifier = null;

        // Custom Header
        if (context.Request.Headers.TryGetValue("X-Tenant", out var tenantHeader))
        {
            tenantIdentifier = tenantHeader.ToString();
        }
        else
        {
            // Subdomain (e.g. john.portfolify.com -> john)
            var host = context.Request.Host.Value;
            if (!string.IsNullOrEmpty(host))
            {
                var parts = host.Split('.');
                if (parts.Length > 2) // has subdomain
                {
                    tenantIdentifier = parts[0];
                }
            }
        }

        if (!string.IsNullOrEmpty(tenantIdentifier))
        {
            var tenant = await dbContext.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Identifier == tenantIdentifier);

            if (tenant != null)
            {
                if (!tenant.IsActive)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync($"Tenant '{tenantIdentifier}' is inactive.");
                    return;
                }

                context.Items["TenantId"] = tenant.Id;
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync($"Tenant '{tenantIdentifier}' not found.");
                return;
            }
        }

        await _next(context);
    }
}
