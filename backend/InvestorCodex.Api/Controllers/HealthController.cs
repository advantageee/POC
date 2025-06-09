using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using InvestorCodex.Api.Configuration;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AdvantageAISettings _advantageAISettings;
    private readonly ApolloSettings _apolloSettings;
    private readonly TwitterAPISettings _twitterSettings;

    public HealthController(
        IOptions<AdvantageAISettings> advantageAISettings,
        IOptions<ApolloSettings> apolloSettings,
        IOptions<TwitterAPISettings> twitterSettings)
    {
        _advantageAISettings = advantageAISettings.Value;
        _apolloSettings = apolloSettings.Value;
        _twitterSettings = twitterSettings.Value;
    }

    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            Services = new
            {
                Database = "Not Connected", // Will be updated when DB is connected
                AzureOpenAI = !string.IsNullOrEmpty(_advantageAISettings.Key) && !string.IsNullOrEmpty(_advantageAISettings.Url) ? "Configured" : "Not Configured",
                Apollo = !string.IsNullOrEmpty(_apolloSettings.ApiKey) ? "Configured" : "Not Configured",
                Twitter = !string.IsNullOrEmpty(_twitterSettings.BearerToken) ? "Configured" : "Not Configured"
            }
        });
    }
}
