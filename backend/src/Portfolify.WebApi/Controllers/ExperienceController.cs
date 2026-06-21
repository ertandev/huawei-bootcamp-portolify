using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Experiences.Commands;
using Microsoft.AspNetCore.Authorization;

namespace Portfolify.WebApi.Controllers;

[Authorize]
public class ExperienceController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateExperienceCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateExperienceCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID mismatch.");
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteExperienceCommand { Id = id });
        return NoContent();
    }
}
