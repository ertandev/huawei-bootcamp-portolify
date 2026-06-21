using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Projects.Commands;

public record UpdateProjectCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public string? ProjectUrl { get; init; }
    public string? GithubUrl { get; init; }
    public string? ImageUrl { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsFeatured { get; init; }
}

public class UpdateProjectCommandValidator : AbstractValidator<UpdateProjectCommand>
{
    public UpdateProjectCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
    }
}

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateProjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException($"Project '{request.Id}' was not found.");

        project.Title = request.Title;
        project.Description = request.Description;
        project.ProjectUrl = request.ProjectUrl;
        project.GithubUrl = request.GithubUrl;
        project.ImageUrl = request.ImageUrl;
        project.DisplayOrder = request.DisplayOrder;
        project.IsFeatured = request.IsFeatured;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
