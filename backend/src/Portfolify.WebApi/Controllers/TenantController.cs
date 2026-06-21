using Microsoft.AspNetCore.Mvc;
using Portfolify.Application.Features.Tenants.Commands;

namespace Portfolify.WebApi.Controllers;

public class TenantController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTenantCommand command)
    {
        return await Mediator.Send(command);
    }
}
