using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Tenants.Commands;

using Microsoft.AspNetCore.Authorization;

namespace Portfolify.WebApi.Controllers;

[Authorize]
public class TenantController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTenantCommand command)
    {
        return await Mediator.Send(command);
    }
}
