using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Educations.Commands;

public record DeleteEducationCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}

public class DeleteEducationCommandHandler : IRequestHandler<DeleteEducationCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteEducationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteEducationCommand request, CancellationToken cancellationToken)
    {
        var education = await _context.Educations
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (education == null)
            throw new KeyNotFoundException($"Education '{request.Id}' was not found.");

        _context.Educations.Remove(education);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
