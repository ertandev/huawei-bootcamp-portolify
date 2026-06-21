using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Skills.Commands;

using Microsoft.AspNetCore.Authorization;

namespace Portfolify.WebApi.Controllers;

[Authorize]
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

    [AllowAnonymous]
    [HttpPost("endorse")]
    public async Task<ActionResult<Guid>> Endorse(EndorseSkillCommand command)
    {
        return await Mediator.Send(command);
    }
}
