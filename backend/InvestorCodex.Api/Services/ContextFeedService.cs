using System.Text.Json;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Models;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface IContextFeedService
{
    Task<MCPContext?> GetContextAsync(string id);
}

public class ContextFeedService : IContextFeedService
{
    private readonly HttpClient _httpClient;
    private readonly ContextFeedSettings _settings;
    private readonly ILogger<ContextFeedService> _logger;

    public ContextFeedService(HttpClient httpClient, IOptions<ContextFeedSettings> settings, ILogger<ContextFeedService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<MCPContext?> GetContextAsync(string id)
    {
        if (!_settings.Feeds.TryGetValue(id, out var url))
        {
            _logger.LogWarning("No feed URL configured for context id {Id}", id);
            return null;
        }

        try
        {
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Context feed HTTP {Status} for {Id}", response.StatusCode, id);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            var context = JsonSerializer.Deserialize<MCPContext>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (context != null)
            {
                return context;
            }

            var dict = JsonSerializer.Deserialize<Dictionary<string, MCPContext>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (dict != null && dict.TryGetValue(id, out var ctx))
            {
                return ctx;
            }

            _logger.LogWarning("Context feed did not contain expected data for {Id}", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching context feed {Id}", id);
            return null;
        }
    }
}
