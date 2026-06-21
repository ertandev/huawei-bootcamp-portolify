using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.SocialLinks.Commands;

public record DeleteSocialLinkCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}

public class DeleteSocialLinkCommandHandler : IRequestHandler<DeleteSocialLinkCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteSocialLinkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteSocialLinkCommand request, CancellationToken cancellationToken)
    {
        var socialLink = await _context.SocialLinks
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (socialLink == null)
            throw new KeyNotFoundException($"Social Link '{request.Id}' was not found.");

        _context.SocialLinks.Remove(socialLink);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
