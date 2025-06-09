using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("context")]
public class ContextController : ControllerBase
{
    private readonly IContextFeedService _contextFeedService;
    private readonly IWebHostEnvironment _env;

    public ContextController(IContextFeedService contextFeedService, IWebHostEnvironment env)
    {
        _contextFeedService = contextFeedService;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<MCPContext>> Get([FromQuery(Name = "id")] string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest("id query parameter required");
        }

        var context = await _contextFeedService.GetContextAsync(id);
        if (context != null)
        {
            return Ok(context);
        }

        // fallback to sample data bundled with the app
        var path = Path.Combine(_env.ContentRootPath, "Data", "context-sample.json");
        if (System.IO.File.Exists(path))
        {
            var json = await System.IO.File.ReadAllTextAsync(path);
            var dict = JsonSerializer.Deserialize<Dictionary<string, MCPContext>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (dict != null && dict.TryGetValue(id, out var sample))
            {
                return Ok(sample);
            }
        }

        return NotFound();
    }
}
