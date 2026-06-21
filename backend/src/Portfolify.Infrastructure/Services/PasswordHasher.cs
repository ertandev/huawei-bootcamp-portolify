using Microsoft.AspNetCore.Identity;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _hasher = new();

    public string HashPassword(string password)
    {
        return _hasher.HashPassword(new User(), password);
    }

    public bool VerifyPassword(string hashedPassword, string providedPassword)
    {
        var result = _hasher.VerifyHashedPassword(new User(), hashedPassword, providedPassword);
        return result != PasswordVerificationResult.Failed;
    }
}
