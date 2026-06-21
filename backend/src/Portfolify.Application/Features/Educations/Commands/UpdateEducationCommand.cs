using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Portfolify.Application.Common.Interfaces;

namespace Portfolify.Application.Features.Educations.Commands;

public record UpdateEducationCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public string School { get; init; } = null!;
    public string Degree { get; init; } = null!;
    public string FieldOfStudy { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
}

public class UpdateEducationCommandValidator : AbstractValidator<UpdateEducationCommand>
{
    public UpdateEducationCommandValidator()
    {
        RuleFor(x => x.School).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Degree).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FieldOfStudy).NotEmpty().MaximumLength(100);
        RuleFor(x => x.StartDate).NotEmpty();
    }
}

public class UpdateEducationCommandHandler : IRequestHandler<UpdateEducationCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateEducationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateEducationCommand request, CancellationToken cancellationToken)
    {
        var education = await _context.Educations
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (education == null)
            throw new KeyNotFoundException($"Education '{request.Id}' was not found.");

        education.School = request.School;
        education.Degree = request.Degree;
        education.FieldOfStudy = request.FieldOfStudy;
        education.StartDate = request.StartDate;
        education.EndDate = request.EndDate;
        education.Description = request.Description;
        education.DisplayOrder = request.DisplayOrder;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
