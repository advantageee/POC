using System.Collections.Concurrent;
using Microsoft.Extensions.Configuration;

namespace InvestorCodex.Api.Services;

public class SettingsStore
{
    private readonly ConcurrentDictionary<string, string> _settings = new();

    public SettingsStore(IConfiguration configuration)
    {
        // Initialize with configuration values
        _settings["apollo_api_key"] = configuration["Apollo:ApiKey"] ?? string.Empty;
        _settings["apollo_base_url"] = configuration["Apollo:BaseUrl"] ?? string.Empty;
        _settings["twitter_api_key"] = configuration["TwitterAPI:ApiKey"] ?? string.Empty;
        _settings["twitter_api_secret"] = configuration["TwitterAPI:ApiSecret"] ?? string.Empty;
        _settings["twitter_bearer_token"] = configuration["TwitterAPI:BearerToken"] ?? string.Empty;
        _settings["openai_endpoint"] = configuration["AdvantageAI:Url"] ?? string.Empty;
        _settings["openai_api_key"] = configuration["AdvantageAI:Key"] ?? string.Empty;
        _settings["openai_model"] = configuration["AdvantageAI:Model"] ?? string.Empty;
        _settings["db_connection_string"] = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
    }

    public IReadOnlyDictionary<string, string> GetAll() => _settings;

    public void Update(Dictionary<string, string> updates)
    {
        foreach (var kv in updates)
        {
            _settings[kv.Key] = kv.Value ?? string.Empty;
        }
    }
}
