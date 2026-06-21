using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.SocialLinks.Commands;

namespace Portfolify.WebApi.Controllers;

public class SocialLinkController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateSocialLinkCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateSocialLinkCommand command)
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
        await Mediator.Send(new DeleteSocialLinkCommand { Id = id });
        return NoContent();
    }
}
