using FluentValidation;
using MediatR;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.SocialLinks.Commands;

public record CreateSocialLinkCommand : IRequest<Guid>
{
    public Guid DeveloperProfileId { get; init; }
    public string PlatformName { get; init; } = null!;
    public string Url { get; init; } = null!;
    public string? IconName { get; init; }
}

public class CreateSocialLinkCommandValidator : AbstractValidator<CreateSocialLinkCommand>
{
    public CreateSocialLinkCommandValidator()
    {
        RuleFor(x => x.PlatformName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Url).NotEmpty();
        RuleFor(x => x.DeveloperProfileId).NotEmpty();
    }
}

public class CreateSocialLinkCommandHandler : IRequestHandler<CreateSocialLinkCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateSocialLinkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSocialLinkCommand request, CancellationToken cancellationToken)
    {
        var socialLink = new SocialLink
        {
            DeveloperProfileId = request.DeveloperProfileId,
            PlatformName = request.PlatformName,
            Url = request.Url,
            IconName = request.IconName
        };

        _context.SocialLinks.Add(socialLink);
        await _context.SaveChangesAsync(cancellationToken);

        return socialLink.Id;
    }
}
