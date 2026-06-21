using FluentValidation;
using MediatR;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.DeveloperProfiles.Commands;

public record CreateDeveloperProfileCommand : IRequest<Guid>
{
    public string FullName { get; init; } = null!;
    public string Title { get; init; } = null!;
    public string Bio { get; init; } = null!;
    public string? AvatarUrl { get; init; }
    public string? ResumeUrl { get; init; }
    public string? BlogUrl { get; init; }
    public string Email { get; init; } = null!;
}

public class CreateDeveloperProfileCommandValidator : AbstractValidator<CreateDeveloperProfileCommand>
{
    public CreateDeveloperProfileCommandValidator()
    {
        RuleFor(v => v.FullName).NotEmpty().MaximumLength(150);
        RuleFor(v => v.Title).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Bio).NotEmpty().MaximumLength(1000);
        RuleFor(v => v.Email).NotEmpty().EmailAddress();
    }
}

public class CreateDeveloperProfileCommandHandler : IRequestHandler<CreateDeveloperProfileCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateDeveloperProfileCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateDeveloperProfileCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId ?? throw new UnauthorizedAccessException("Tenant is not identified.");

        var entity = new DeveloperProfile
        {
            TenantId = tenantId,
            FullName = request.FullName,
            Title = request.Title,
            Bio = request.Bio,
            AvatarUrl = request.AvatarUrl,
            ResumeUrl = request.ResumeUrl,
            BlogUrl = request.BlogUrl,
            Email = request.Email
        };

        _context.DeveloperProfiles.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
