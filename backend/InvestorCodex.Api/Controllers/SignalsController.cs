using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignalsController : ControllerBase
{
    [HttpGet]
    public ActionResult<PaginatedResponse<Signal>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? types = null,
        [FromQuery] string[]? severities = null)
    {
        // TODO: Implement database repository for signals
        return StatusCode(501, "Signals API is not yet implemented with database integration. Please implement ISignalRepository and update this controller.");
    }

    [HttpGet("{id}")]
    public ActionResult<Signal> GetById(Guid id)
    {
        // TODO: Implement database repository for signals
        return StatusCode(501, "Signals API is not yet implemented with database integration. Please implement ISignalRepository and update this controller.");
    }

    [HttpPost]
    public ActionResult<Signal> Post([FromBody] Signal signal)
    {
        // TODO: Implement database repository for signals
        return StatusCode(501, "Signals API is not yet implemented with database integration. Please implement ISignalRepository and update this controller.");
    }

    [HttpPut("{id}")]
    public ActionResult<Signal> Put(Guid id, [FromBody] Signal signal)
    {
        // TODO: Implement database repository for signals
        return StatusCode(501, "Signals API is not yet implemented with database integration. Please implement ISignalRepository and update this controller.");
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(Guid id)
    {
        // TODO: Implement database repository for signals
        return StatusCode(501, "Signals API is not yet implemented with database integration. Please implement ISignalRepository and update this controller.");
    }
}
