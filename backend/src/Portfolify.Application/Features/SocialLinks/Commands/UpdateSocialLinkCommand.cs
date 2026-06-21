using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.SocialLinks.Commands;

public record UpdateSocialLinkCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public string PlatformName { get; init; } = null!;
    public string Url { get; init; } = null!;
    public string? IconName { get; init; }
}

public class UpdateSocialLinkCommandValidator : AbstractValidator<UpdateSocialLinkCommand>
{
    public UpdateSocialLinkCommandValidator()
    {
        RuleFor(x => x.PlatformName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Url).NotEmpty();
    }
}

public class UpdateSocialLinkCommandHandler : IRequestHandler<UpdateSocialLinkCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateSocialLinkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateSocialLinkCommand request, CancellationToken cancellationToken)
    {
        var socialLink = await _context.SocialLinks
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (socialLink == null)
            throw new KeyNotFoundException($"Social Link '{request.Id}' was not found.");

        socialLink.PlatformName = request.PlatformName;
        socialLink.Url = request.Url;
        socialLink.IconName = request.IconName;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
