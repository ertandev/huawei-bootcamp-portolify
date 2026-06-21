using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Projects.Commands;

namespace Portfolify.WebApi.Controllers;

public class ProjectController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateProjectCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateProjectCommand command)
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
        await Mediator.Send(new DeleteProjectCommand { Id = id });
        return NoContent();
    }
}
