using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Educations.Commands;
using Microsoft.AspNetCore.Authorization;

namespace Portfolify.WebApi.Controllers;

[Authorize]
public class EducationController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateEducationCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateEducationCommand command)
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
        await Mediator.Send(new DeleteEducationCommand { Id = id });
        return NoContent();
    }
}
