using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Application.Features.Auth.DTOs;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Auth.Commands;

public record LoginCommand : IRequest<AuthResponseDto>
{
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Find user globally, including their Tenant (ignoring multi-tenant query filters during login verification)
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        // Verify password using custom IPasswordHasher
        var isValid = _passwordHasher.VerifyPassword(user.PasswordHash, request.Password);

        if (!isValid)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        if (!user.Tenant.IsActive)
        {
            throw new InvalidOperationException("This account/tenant is deactivated.");
        }

        // Generate Token
        var token = _jwtTokenGenerator.GenerateToken(user, user.Tenant.Identifier);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            TenantId = user.TenantId,
            TenantIdentifier = user.Tenant.Identifier
        };
    }
}
