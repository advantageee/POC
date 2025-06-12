using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Services;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly SettingsStore _store;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(SettingsStore store, ILogger<SettingsController> logger)
    {
        _store = store;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IDictionary<string, string>> GetSettings()
    {
        return Ok(_store.GetAll());
    }

    [HttpPost]
    public IActionResult UpdateSettings([FromBody] Dictionary<string, string> updates)
    {
        if (updates == null)
        {
            return BadRequest();
        }

        _logger.LogInformation("Updating settings: {Keys}", string.Join(",", updates.Keys));
        _store.Update(updates);
        return Ok(_store.GetAll());
    }
}
