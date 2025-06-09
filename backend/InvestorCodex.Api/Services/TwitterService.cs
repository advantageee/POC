using System.Text.Json;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Configuration;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;

namespace InvestorCodex.Api.Services;

public interface ITwitterService
{
    Task<List<Signal>> GetSignalsAsync(string? companyName = null, int maxResults = 10);
}

public class TwitterService : ITwitterService
{
    private readonly HttpClient _httpClient;
    private readonly TwitterAPISettings _settings;
    private readonly ILogger<TwitterService> _logger;

    public TwitterService(HttpClient httpClient, IOptions<TwitterAPISettings> settings, ILogger<TwitterService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _settings.BearerToken);
    }

    public async Task<List<Signal>> GetSignalsAsync(string? companyName = null, int maxResults = 10)
    {
        try
        {
            var query = string.IsNullOrEmpty(companyName) 
                ? "startup funding investment OR \"series A\" OR \"series B\" OR IPO -is:retweet lang:en"
                : $"{companyName} funding investment OR acquisition OR partnership -is:retweet lang:en";

            var encodedQuery = Uri.EscapeDataString(query);
            var url = $"https://api.twitter.com/2/tweets/search/recent?query={encodedQuery}&max_results={Math.Max(10, Math.Min(maxResults, 100))}&tweet.fields=created_at,author_id,public_metrics,context_annotations&expansions=author_id&user.fields=username,name,verified";

            var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var twitterResponse = JsonSerializer.Deserialize<TwitterSearchResponse>(responseJson, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                });

                return twitterResponse?.Data?.Select(MapToSignal).ToList() ?? GetFallbackSignals(companyName);
            }
            else
            {
                _logger.LogError("Twitter API error: {StatusCode} - {Content}", response.StatusCode, await response.Content.ReadAsStringAsync());
                return GetFallbackSignals(companyName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching signals from Twitter API");
            return GetFallbackSignals(companyName);
        }
    }

    private Signal MapToSignal(TwitterTweet tweet)
    {
        var severity = DetermineSeverity(tweet.Text ?? "");
        var signalType = DetermineSignalType(tweet.Text ?? "");        return new Signal
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(), // Would need proper company linking
            Type = signalType,
            Severity = severity,
            Title = ExtractTitle(tweet.Text ?? ""),
            Description = tweet.Text ?? "",
            Source = "Twitter",
            Url = $"https://twitter.com/i/web/status/{tweet.Id}",
            DetectedAt = tweet.CreatedAt ?? DateTime.UtcNow
        };
    }

    private string DetermineSeverity(string text)
    {
        var lowerText = text.ToLower();
        if (lowerText.Contains("acquisition") || lowerText.Contains("merger") || lowerText.Contains("ipo"))
            return "High";
        if (lowerText.Contains("funding") || lowerText.Contains("series") || lowerText.Contains("investment"))
            return "Medium";
        return "Low";
    }

    private string DetermineSignalType(string text)
    {
        var lowerText = text.ToLower();
        if (lowerText.Contains("funding") || lowerText.Contains("series") || lowerText.Contains("investment"))
            return "Funding";
        if (lowerText.Contains("acquisition") || lowerText.Contains("merger"))
            return "Acquisition";
        if (lowerText.Contains("partnership") || lowerText.Contains("collaboration"))
            return "Partnership";
        if (lowerText.Contains("ipo") || lowerText.Contains("public"))
            return "IPO";
        return "News";
    }

    private string ExtractTitle(string text)
    {
        // Extract first sentence or first 100 characters as title
        var sentences = text.Split('.', '!', '?');
        var title = sentences.Length > 0 ? sentences[0].Trim() : text;
        return title.Length > 100 ? title.Substring(0, 97) + "..." : title;
    }

    private List<Signal> GetFallbackSignals(string? companyName)
    {
        return new List<Signal>
        {                new Signal
                {
                    Id = Guid.NewGuid(),
                    CompanyId = Guid.NewGuid(),
                    Type = "Funding",
                    Severity = "Medium",
                    Title = $"Sample funding signal for {companyName ?? "startup companies"}",
                    Description = "This is a fallback signal when Twitter API is not available. Real signals would come from live Twitter data.",
                    Source = "Twitter",
                    Url = "https://twitter.com",
                    DetectedAt = DateTime.UtcNow
                },
                new Signal
                {
                    Id = Guid.NewGuid(),
                    CompanyId = Guid.NewGuid(),
                    Type = "Partnership",
                    Severity = "Low",
                    Title = "Strategic partnership announcement",
                    Description = "Sample partnership signal. Real data would show actual company partnerships and collaborations from Twitter.",
                    Source = "Twitter",
                    Url = "https://twitter.com",
                    DetectedAt = DateTime.UtcNow.AddHours(-2)
                }
        };
    }
}

// Twitter API response models
public class TwitterSearchResponse
{
    public List<TwitterTweet>? Data { get; set; }
    public TwitterIncludes? Includes { get; set; }
}

public class TwitterTweet
{
    public string? Id { get; set; }
    public string? Text { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? AuthorId { get; set; }
    public TwitterPublicMetrics? PublicMetrics { get; set; }
}

public class TwitterIncludes
{
    public List<TwitterUser>? Users { get; set; }
}

public class TwitterUser
{
    public string? Id { get; set; }
    public string? Username { get; set; }
    public string? Name { get; set; }
    public bool? Verified { get; set; }
}

public class TwitterPublicMetrics
{
    public int RetweetCount { get; set; }
    public int LikeCount { get; set; }
    public int QuoteCount { get; set; }
    public int ReplyCount { get; set; }
}
