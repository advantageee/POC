using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using InvestorCodex.Api.Configuration;
using Npgsql;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AdvantageAISettings _advantageAISettings;
    private readonly ApolloSettings _apolloSettings;
    private readonly TwitterAPISettings _twitterSettings;
    private readonly IConfiguration _configuration;

    public HealthController(
        IOptions<AdvantageAISettings> advantageAISettings,
        IOptions<ApolloSettings> apolloSettings,
        IOptions<TwitterAPISettings> twitterSettings,
        IConfiguration configuration)
    {
        _advantageAISettings = advantageAISettings.Value;
        _apolloSettings = apolloSettings.Value;
        _twitterSettings = twitterSettings.Value;
        _configuration = configuration;
    }    [HttpGet]
    public async Task<ActionResult<object>> Get()
    {
        var databaseStatus = await CheckDatabaseConnectionAsync();
        
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            Services = new
            {
                Database = databaseStatus,
                AzureOpenAI = !string.IsNullOrEmpty(_advantageAISettings.Key) && !string.IsNullOrEmpty(_advantageAISettings.Url) ? "Configured" : "Not Configured",
                Apollo = !string.IsNullOrEmpty(_apolloSettings.ApiKey) ? "Configured" : "Not Configured",
                Twitter = !string.IsNullOrEmpty(_twitterSettings.BearerToken) ? "Configured" : "Not Configured"
            }
        });
    }

    private async Task<string> CheckDatabaseConnectionAsync()
    {
        try
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return "Not Configured";
            }

            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            
            // Test with a simple query
            using var command = new NpgsqlCommand("SELECT 1", connection);
            await command.ExecuteScalarAsync();
            
            return "Connected";
        }
        catch (Exception)
        {
            return "Connection Failed";
        }
    }
}
