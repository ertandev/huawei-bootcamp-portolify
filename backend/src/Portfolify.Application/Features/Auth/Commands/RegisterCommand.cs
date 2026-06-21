using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Application.Features.Auth.DTOs;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Auth.Commands;

public record RegisterCommand : IRequest<AuthResponseDto>
{
    public string TenantName { get; init; } = null!;
    public string TenantIdentifier { get; init; } = null!;
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
    public string FullName { get; init; } = null!;
    public string Title { get; init; } = null!;
}

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.TenantName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TenantIdentifier)
            .NotEmpty()
            .MaximumLength(50)
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Tenant identifier must consist of lowercase letters, numbers, and hyphens only.");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if TenantIdentifier is taken (ignoring filters since we are checking global availability)
        var tenantExists = await _context.Tenants
            .AnyAsync(t => t.Identifier == request.TenantIdentifier.ToLower(), cancellationToken);

        if (tenantExists)
        {
            throw new InvalidOperationException($"Tenant identifier '{request.TenantIdentifier}' is already taken.");
        }

        // 2. Check if Email is taken globally (ignoring query filters)
        var emailExists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (emailExists)
        {
            throw new InvalidOperationException($"Email address '{request.Email}' is already registered.");
        }

        // 3. Create Tenant
        var tenant = new Tenant
        {
            Name = request.TenantName,
            Identifier = request.TenantIdentifier.ToLower(),
            IsActive = true
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Create User (need to set the TenantId explicitly because we haven't set the CurrentUserService context yet)
        var user = new User
        {
            TenantId = tenant.Id,
            Email = request.Email.ToLower(),
            Role = "User"
        };
        user.PasswordHash = _passwordHasher.HashPassword(request.Password);

        _context.Users.Add(user);

        // 5. Create Developer Profile
        var profile = new DeveloperProfile
        {
            TenantId = tenant.Id,
            FullName = request.FullName,
            Title = request.Title,
            Email = request.Email.ToLower(),
            Bio = "Welcome to my developer profile! Edit this bio to tell others about yourself.",
            AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        };

        _context.DeveloperProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        // 6. Generate Token
        var token = _jwtTokenGenerator.GenerateToken(user, tenant.Identifier);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            TenantId = tenant.Id,
            TenantIdentifier = tenant.Identifier
        };
    }
}
