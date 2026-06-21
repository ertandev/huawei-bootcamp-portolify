using FluentValidation;
using MediatR;
using Portfolify.Application.Common.Interfaces;
using Portfolify.Domain.Entities;

namespace Portfolify.Application.Features.Projects.Commands;

public record CreateProjectCommand : IRequest<Guid>
{
    public Guid DeveloperProfileId { get; init; }
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public string? ProjectUrl { get; init; }
    public string? GithubUrl { get; init; }
    public string? ImageUrl { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsFeatured { get; init; }
}

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.DeveloperProfileId).NotEmpty();
    }
}

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateProjectCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            DeveloperProfileId = request.DeveloperProfileId,
            Title = request.Title,
            Description = request.Description,
            ProjectUrl = request.ProjectUrl,
            GithubUrl = request.GithubUrl,
            ImageUrl = request.ImageUrl,
            DisplayOrder = request.DisplayOrder,
            IsFeatured = request.IsFeatured
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
}
