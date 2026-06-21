using System.Net;
using System.Text.Json;
using FluentValidation;

namespace Portfolify.WebApi.Middlewares;

public class CustomExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomExceptionMiddleware> _logger;

    public CustomExceptionMiddleware(RequestDelegate next, ILogger<CustomExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var statusCode = (int)HttpStatusCode.InternalServerError;
        var message = "An unexpected error occurred.";
        object? errors = null;

        switch (exception)
        {
            case InvalidOperationException invalidOpEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                message = invalidOpEx.Message;
                break;
            case ValidationException valEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                message = "Validation failed.";
                errors = valEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage });
                break;
            case KeyNotFoundException keyEx:
                statusCode = (int)HttpStatusCode.NotFound;
                message = keyEx.Message;
                break;
            case UnauthorizedAccessException unauthEx:
                statusCode = (int)HttpStatusCode.Unauthorized;
                message = unauthEx.Message;
                break;
        }

        context.Response.StatusCode = statusCode;

        var result = JsonSerializer.Serialize(new
        {
            message,
            errors
        });

        return context.Response.WriteAsync(result);
    }
}
