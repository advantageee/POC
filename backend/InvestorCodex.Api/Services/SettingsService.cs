using InvestorCodex.Api.Models;
using Microsoft.Extensions.Configuration;

namespace InvestorCodex.Api.Services;

public interface ISettingsService
{
    SettingsDto GetSettings();
    void UpdateSettings(SettingsDto newSettings);
}

public class InMemorySettingsService : ISettingsService
{
    private SettingsDto _settings;

    public InMemorySettingsService(IConfiguration configuration)
    {
        _settings = new SettingsDto
        {
            ApolloApiKey = configuration["Apollo:ApiKey"] ?? string.Empty,
            ApolloBaseUrl = configuration["Apollo:BaseUrl"] ?? string.Empty,
            TwitterApiKey = configuration["TwitterAPI:ApiKey"] ?? string.Empty,
            TwitterApiSecret = configuration["TwitterAPI:ApiSecret"] ?? string.Empty,
            TwitterBearerToken = configuration["TwitterAPI:BearerToken"] ?? string.Empty,
            OpenAIEndpoint = configuration["AdvantageAI:Url"] ?? string.Empty,
            OpenAIApiKey = configuration["AdvantageAI:Key"] ?? string.Empty,
            OpenAIModel = configuration["AdvantageAI:Model"] ?? string.Empty,
            DbConnectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty
        };
    }

    public SettingsDto GetSettings() => _settings;

    public void UpdateSettings(SettingsDto newSettings)
    {
        _settings = newSettings;
    }
}
