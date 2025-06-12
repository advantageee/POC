using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _service;

    public SettingsController(ISettingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<SettingsDto> Get()
    {
        return Ok(_service.GetSettings());
    }

    [HttpPut]
    public IActionResult Update([FromBody] SettingsDto dto)
    {
        _service.UpdateSettings(dto);
        return NoContent();
    }
}
