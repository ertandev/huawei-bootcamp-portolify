using MediatR;
using Microsoft.Extensions.Logging;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger, ICurrentUserService currentUserService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.UserId ?? "Anonymous";
        var tenantId = _currentUserService.TenantId?.ToString() ?? "Cross-Tenant";

        _logger.LogInformation("Portfolify Request: {Name} | Tenant: {TenantId} | User: {UserId} | Request: {@Request}",
            requestName, tenantId, userId, request);

        var response = await next();

        _logger.LogInformation("Portfolify Response: {Name} | Handled successfully.", requestName);

        return response;
    }
}
