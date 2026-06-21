using Microsoft.AspNetCore.Mvc;
using MediatR;
using Portfolify.Application.Features.DeveloperProfiles.Commands;
using Portfolify.Application.Features.DeveloperProfiles.DTOs;
using Portfolify.Application.Features.DeveloperProfiles.Queries;

using Microsoft.AspNetCore.Authorization;

namespace Portfolify.WebApi.Controllers;

[Authorize]
public class DeveloperProfileController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateDeveloperProfileCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateDeveloperProfileCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID mismatch.");
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<DeveloperProfileDto>> Get(Guid id)
    {
        var result = await Mediator.Send(new GetDeveloperProfileQuery { Id = id });
        if (result == null)
            return NotFound();

        return result;
    }

    [AllowAnonymous]
    [HttpGet("details")]
    public async Task<ActionResult<DeveloperProfileDetailsDto>> GetDetails()
    {
        // Resolves dynamically based on subdomain/header of the current tenant request context
        var result = await Mediator.Send(new GetDeveloperProfileDetailsQuery());
        if (result == null)
            return NotFound("No profile found for this tenant.");

        return result;
    }
}
