using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Application.Features.Auth.DTOs;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Auth.Commands;

public record RegisterCommand : IRequest<AuthResponseDto>
{
    public string Username { get; init; } = null!;
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
    public string FullName { get; init; } = null!;
    public string Title { get; init; } = null!;
}

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MaximumLength(50)
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Username must consist of lowercase letters, numbers, and hyphens only.");
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
        // 1. Check if Username is taken
        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username == request.Username.ToLower(), cancellationToken);

        if (usernameExists)
        {
            throw new InvalidOperationException($"Username '{request.Username}' is already taken.");
        }

        // 2. Check if Email is taken globally
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (emailExists)
        {
            throw new InvalidOperationException($"Email address '{request.Email}' is already registered.");
        }

        // 3. Create User
        var user = new User
        {
            Username = request.Username.ToLower(),
            Email = request.Email.ToLower(),
            Role = "User"
        };
        user.PasswordHash = _passwordHasher.HashPassword(request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Create Developer Profile linked directly to the User
        var profile = new DeveloperProfile
        {
            UserId = user.Id,
            FullName = request.FullName,
            Title = request.Title,
            Email = request.Email.ToLower(),
            Bio = "Welcome to my developer profile! Edit this bio to tell others about yourself.",
            AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        };

        _context.DeveloperProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        // 5. Generate Token
        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            UserId = user.Id,
            Username = user.Username
        };
    }
}
