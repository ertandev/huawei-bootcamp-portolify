using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.DeveloperProfiles.Commands;

public record UpdateDeveloperProfileCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = null!;
    public string Title { get; init; } = null!;
    public string Bio { get; init; } = null!;
    public string? AvatarUrl { get; init; }
    public string? ResumeUrl { get; init; }
    public string? BlogUrl { get; init; }
    public string Email { get; init; } = null!;
}

public class UpdateDeveloperProfileCommandValidator : AbstractValidator<UpdateDeveloperProfileCommand>
{
    public UpdateDeveloperProfileCommandValidator()
    {
        RuleFor(v => v.FullName).NotEmpty().MaximumLength(150);
        RuleFor(v => v.Title).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Bio).NotEmpty().MaximumLength(1000);
        RuleFor(v => v.Email).NotEmpty().EmailAddress();
    }
}

public class UpdateDeveloperProfileCommandHandler : IRequestHandler<UpdateDeveloperProfileCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateDeveloperProfileCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateDeveloperProfileCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DeveloperProfiles
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (entity == null)
            throw new KeyNotFoundException($"Developer Profile '{request.Id}' was not found.");

        entity.FullName = request.FullName;
        entity.Title = request.Title;
        entity.Bio = request.Bio;
        entity.AvatarUrl = request.AvatarUrl;
        entity.ResumeUrl = request.ResumeUrl;
        entity.BlogUrl = request.BlogUrl;
        entity.Email = request.Email;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
