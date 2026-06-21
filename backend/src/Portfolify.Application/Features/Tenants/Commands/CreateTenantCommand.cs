using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Tenants.Commands;

public record CreateTenantCommand : IRequest<Guid>
{
    public string Name { get; init; } = null!;
    public string Identifier { get; init; } = null!; // Subdomain
}

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Identifier)
            .NotEmpty()
            .MaximumLength(50)
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Tenant identifier must consist of lowercase letters, numbers, and hyphens only.");
    }
}

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateTenantCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Tenants
            .AnyAsync(t => t.Identifier == request.Identifier.ToLower(), cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException($"Tenant identifier '{request.Identifier}' is already taken.");
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            Identifier = request.Identifier.ToLower(),
            IsActive = true
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync(cancellationToken);

        return tenant.Id;
    }
}
