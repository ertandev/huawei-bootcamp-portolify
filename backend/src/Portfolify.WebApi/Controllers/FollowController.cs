using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Followers.Commands;

namespace Portfolify.WebApi.Controllers;

public class FollowController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Follow(FollowDeveloperCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPost("unfollow")]
    public async Task<ActionResult> Unfollow(UnfollowDeveloperCommand command)
    {
        await Mediator.Send(command);
        return NoContent();
    }
}
