using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Auth.Commands;
using Portfolify.Application.Features.Auth.DTOs;

namespace Portfolify.WebApi.Controllers;

public class AuthController : ApiControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginCommand command)
    {
        return await Mediator.Send(command);
    }
}
