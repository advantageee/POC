using System.Text.Json;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Models;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface IContextFeedService
{
    Task<MCPContext?> GetContextAsync(string id);
    Task<List<MCPEntry>> GetLatestNewsAsync(int limit = 10);
    Task<MCPContext> GetVCLatestAsync();
    Task<MCPContext> GetInvestorWeeklyAsync();
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
        
        // Set up HTTP client with appropriate headers for MCP protocol
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "InvestorCodex/1.0 MCP-Client");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<MCPContext?> GetContextAsync(string id)
    {
        if (!_settings.Feeds.TryGetValue(id, out var url))
        {
            _logger.LogWarning("No feed URL configured for context id {Id}, returning fallback data", id);
            return GetFallbackContext(id);
        }

        try
        {
            _logger.LogInformation("Fetching MCP context from {Url} for id {Id}", url, id);
            
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Context feed HTTP {Status} for {Id}, returning fallback", response.StatusCode, id);
                return GetFallbackContext(id);
            }

            var json = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("Received MCP response: {Json}", json);
            
            // Try to deserialize as direct MCPContext
            var context = JsonSerializer.Deserialize<MCPContext>(json, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            });
            
            if (context != null && context.Entries?.Any() == true)
            {
                _logger.LogInformation("Successfully parsed MCP context with {Count} entries", context.Entries.Count);
                return context;
            }

            // Try to deserialize as dictionary containing contexts
            var dict = JsonSerializer.Deserialize<Dictionary<string, MCPContext>>(json, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            });
            
            if (dict != null && dict.TryGetValue(id, out var ctx))
            {
                _logger.LogInformation("Successfully parsed MCP context from dictionary with {Count} entries", ctx.Entries?.Count ?? 0);
                return ctx;
            }

            _logger.LogWarning("Context feed did not contain expected data for {Id}, returning fallback", id);
            return GetFallbackContext(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching context feed {Id}, returning fallback", id);
            return GetFallbackContext(id);
        }
    }

    public async Task<List<MCPEntry>> GetLatestNewsAsync(int limit = 10)
    {
        var context = await GetContextAsync("vc-latest");
        return context?.Entries?.Take(limit).ToList() ?? new List<MCPEntry>();
    }

    public async Task<MCPContext> GetVCLatestAsync()
    {
        return await GetContextAsync("vc-latest") ?? GetFallbackContext("vc-latest");
    }

    public async Task<MCPContext> GetInvestorWeeklyAsync()
    {
        return await GetContextAsync("investor-weekly") ?? GetFallbackContext("investor-weekly");
    }

    private MCPContext GetFallbackContext(string id)
    {
        var now = DateTime.UtcNow;
        
        return id switch
        {
            "vc-latest" => new MCPContext
            {
                Id = id,
                Title = "Latest VC News",
                Timestamp = now,
                Entries = new List<MCPEntry>
                {
                    new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Headline = "AI Startup Raises $50M Series A",
                        Summary = "A promising artificial intelligence startup focused on enterprise automation has secured $50 million in Series A funding.",
                        Link = "https://example.com/ai-startup-funding",
                        PublishedAt = now.AddHours(-2),
                        Source = "TechCrunch",
                        Topics = new List<string> { "AI", "Funding", "Series A" },
                        Confidence = 0.9f
                    },
                    new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Headline = "Venture Capital Trends Q4 2024",
                        Summary = "Investment activity shows continued strength in SaaS and fintech sectors, with enterprise software leading deal volume.",
                        Link = "https://example.com/vc-trends-q4",
                        PublishedAt = now.AddHours(-4),
                        Source = "VentureBeat",
                        Topics = new List<string> { "Trends", "SaaS", "Fintech" },
                        Confidence = 0.85f
                    },
                    new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Headline = "New $200M Climate Tech Fund Launched",
                        Summary = "Major VC firm announces dedicated climate technology fund targeting clean energy and sustainability startups.",
                        Link = "https://example.com/climate-tech-fund",
                        PublishedAt = now.AddHours(-6),
                        Source = "GreenTech Media",
                        Topics = new List<string> { "Climate Tech", "Fund Launch", "Sustainability" },
                        Confidence = 0.88f
                    }
                }
            },
            "investor-weekly" => new MCPContext
            {
                Id = id,
                Title = "Weekly Investor Intelligence",
                Timestamp = now,
                Entries = new List<MCPEntry>
                {
                    new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Headline = "Top 10 Most Active VCs This Week",
                        Summary = "Analysis of the most active venture capital firms based on deal announcements and portfolio company updates.",
                        Link = "https://example.com/active-vcs-weekly",
                        PublishedAt = now.AddDays(-1),
                        Source = "PitchBook",
                        Topics = new List<string> { "VC Activity", "Deal Flow", "Analysis" },
                        Confidence = 0.92f
                    },
                    new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Headline = "Emerging Market Investment Opportunities",
                        Summary = "Southeast Asia and Latin America show strong growth in tech investment with focus on fintech and e-commerce.",
                        Link = "https://example.com/emerging-markets",
                        PublishedAt = now.AddDays(-2),
                        Source = "Crunchbase",
                        Topics = new List<string> { "Emerging Markets", "International", "Growth" },
                        Confidence = 0.87f
                    }
                }
            },
            _ => new MCPContext
            {
                Id = id,
                Title = $"Context Feed: {id}",
                Timestamp = now,
                Entries = new List<MCPEntry>
                {
                    new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Headline = "Sample News Entry",
                        Summary = "This is a fallback entry when the MCP context feed is unavailable.",
                        Link = "https://example.com/fallback",
                        PublishedAt = now,
                        Source = "System",
                        Topics = new List<string> { "System", "Fallback" },
                        Confidence = 0.5f
                    }
                }
            }
        };
    }
}
