namespace Portfolify.Application.Features.Auth.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public string Email { get; set; } = null!;
    public Guid TenantId { get; set; }
    public string TenantIdentifier { get; set; } = null!;
}
