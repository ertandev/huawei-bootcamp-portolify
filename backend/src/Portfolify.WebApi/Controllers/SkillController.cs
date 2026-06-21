using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Skills.Commands;

namespace Portfolify.WebApi.Controllers;

public class SkillController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateSkillCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteSkillCommand { Id = id });
        return NoContent();
    }

    [HttpPost("endorse")]
    public async Task<ActionResult<Guid>> Endorse(EndorseSkillCommand command)
    {
        return await Mediator.Send(command);
    }
}
