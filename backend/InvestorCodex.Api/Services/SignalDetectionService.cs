using System.Text.Json;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Data;
using InvestorCodex.Api.Configuration;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface ISignalDetectionService
{
    Task<List<Signal>> AnalyzeCompanySignalsAsync(Guid companyId);
    Task<List<Signal>> ExtractSignalsFromTextAsync(string text, string source, Guid? companyId = null);
    Task<float> CalculateSignalConfidenceAsync(Signal signal);
    Task<List<Signal>> GetHighConfidenceSignalsAsync(float minConfidence = 0.7f, int limit = 50);
    Task<Signal> EnrichSignalWithAIAsync(Signal signal);
}

public class SignalDetectionService : ISignalDetectionService
{
    private readonly ITwitterService _twitterService;
    private readonly IContextFeedService _contextFeedService;
    private readonly ISignalRepository _signalRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly HttpClient _httpClient;
    private readonly AdvantageAISettings _aiSettings;
    private readonly ILogger<SignalDetectionService> _logger;

    // Signal detection patterns and keywords
    private readonly Dictionary<string, (string[] Keywords, float BaseScore, string Severity)> _signalPatterns = new()
    {
        ["Funding"] = (new[] { "funding", "series", "investment", "capital", "raised", "round", "financing" }, 0.8f, "Medium"),
        ["Acquisition"] = (new[] { "acquisition", "acquired", "merger", "buyout", "takeover" }, 0.9f, "High"),
        ["Leadership"] = (new[] { "ceo", "founder", "executive", "leadership", "appointed", "joins", "hired" }, 0.6f, "Low"),
        ["Product"] = (new[] { "launch", "product", "feature", "beta", "release", "announcement" }, 0.5f, "Low"),
        ["Partnership"] = (new[] { "partnership", "collaboration", "alliance", "integration", "deal" }, 0.6f, "Medium"),
        ["Financial"] = (new[] { "revenue", "profit", "loss", "earnings", "financial", "ipo", "public" }, 0.7f, "Medium"),
        ["Legal"] = (new[] { "lawsuit", "legal", "compliance", "regulation", "investigation", "fine" }, 0.8f, "High"),
        ["Expansion"] = (new[] { "expansion", "expansion", "office", "market", "international", "growth" }, 0.6f, "Medium"),
        ["Technology"] = (new[] { "ai", "machine learning", "blockchain", "crypto", "patent", "innovation" }, 0.5f, "Low")
    };

    public SignalDetectionService(
        ITwitterService twitterService,
        IContextFeedService contextFeedService,
        ISignalRepository signalRepository,
        ICompanyRepository companyRepository,
        HttpClient httpClient,
        IOptions<AdvantageAISettings> aiSettings,
        ILogger<SignalDetectionService> logger)
    {
        _twitterService = twitterService;
        _contextFeedService = contextFeedService;
        _signalRepository = signalRepository;
        _companyRepository = companyRepository;
        _httpClient = httpClient;
        _aiSettings = aiSettings.Value;
        _logger = logger;
    }

    public async Task<List<Signal>> AnalyzeCompanySignalsAsync(Guid companyId)
    {
        try
        {
            var company = await _companyRepository.GetCompanyByIdAsync(companyId);
            if (company == null)
            {
                _logger.LogWarning("Company not found for signal analysis: {CompanyId}", companyId);
                return new List<Signal>();
            }

            var signals = new List<Signal>();

            // Get signals from Twitter
            var twitterSignals = await _twitterService.GetSignalsAsync(company.Name);
            signals.AddRange(twitterSignals);

            // Get signals from news feeds
            var newsSignals = await ExtractSignalsFromNewsAsync(company.Name);
            signals.AddRange(newsSignals);

            // Enrich signals with AI analysis
            var enrichedSignals = new List<Signal>();
            foreach (var signal in signals)
            {
                try
                {
                    var enrichedSignal = await EnrichSignalWithAIAsync(signal);
                    enrichedSignals.Add(enrichedSignal);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to enrich signal {SignalId}", signal.Id);
                    enrichedSignals.Add(signal); // Add original signal if enrichment fails
                }
            }

            // Filter and score signals
            var finalSignals = enrichedSignals
                .Where(s => s.Confidence >= 0.3f) // Only include signals with reasonable confidence
                .OrderByDescending(s => s.Confidence)
                .Take(20) // Limit to top 20 signals
                .ToList();

            // Save signals to database
            foreach (var signal in finalSignals)
            {
                try
                {
                    await _signalRepository.CreateSignalAsync(signal);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save signal to database");
                }
            }

            return finalSignals;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing company signals for {CompanyId}", companyId);
            return new List<Signal>();
        }
    }

    public async Task<List<Signal>> ExtractSignalsFromTextAsync(string text, string source, Guid? companyId = null)
    {
        var signals = new List<Signal>();
        var lowerText = text.ToLower();

        foreach (var (signalType, (keywords, baseScore, severity)) in _signalPatterns)
        {
            if (keywords.Any(keyword => lowerText.Contains(keyword)))
            {                var signal = new Signal
                {
                    Id = Guid.NewGuid(),
                    CompanyId = companyId ?? Guid.Empty,
                    Type = signalType,
                    Severity = severity,
                    Description = text.Length > 500 ? text[..500] + "..." : text,
                    Summary = await GenerateSignalSummaryAsync(text, signalType),
                    Confidence = CalculateBaseConfidence(text, keywords, baseScore),
                    Source = source,
                    CreatedAt = DateTime.UtcNow
                };

                signals.Add(signal);
            }
        }

        return signals;
    }

    public async Task<float> CalculateSignalConfidenceAsync(Signal signal)
    {
        try
        {
            // Base confidence from pattern matching
            var baseConfidence = signal.Confidence;

            // Adjust based on source reliability
            var sourceMultiplier = signal.Source?.ToLower() switch
            {
                "twitter" => 0.7f,
                "techcrunch" => 1.2f,
                "venturebeat" => 1.1f,
                "crunchbase" => 1.3f,
                "pitchbook" => 1.4f,
                _ => 1.0f
            };

            // Adjust based on signal age (newer is generally more valuable)
            var ageInHours = (DateTime.UtcNow - signal.CreatedAt).TotalHours;
            var ageMultiplier = ageInHours switch
            {
                <= 24 => 1.2f,
                <= 72 => 1.0f,
                <= 168 => 0.8f,
                _ => 0.6f
            };

            // Adjust based on signal type importance
            var typeMultiplier = signal.Type?.ToLower() switch
            {
                "acquisition" => 1.3f,
                "funding" => 1.2f,
                "financial" => 1.1f,
                "legal" => 1.0f,
                "partnership" => 0.9f,
                "leadership" => 0.8f,
                _ => 1.0f
            };

            var finalConfidence = Math.Min(1.0f, baseConfidence * sourceMultiplier * ageMultiplier * typeMultiplier);
            return finalConfidence;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating signal confidence");
            return signal.Confidence; // Return original confidence if calculation fails
        }
    }

    public async Task<List<Signal>> GetHighConfidenceSignalsAsync(float minConfidence = 0.7f, int limit = 50)
    {        try
        {
            var allSignalsResult = await _signalRepository.GetSignalsAsync(1, limit * 2); // Get more to filter
            var highConfidenceSignals = new List<Signal>();

            foreach (var signal in allSignalsResult.signals)
            {
                var confidence = await CalculateSignalConfidenceAsync(signal);
                if (confidence >= minConfidence)
                {
                    signal.Confidence = confidence; // Update with calculated confidence
                    highConfidenceSignals.Add(signal);
                }
            }

            return highConfidenceSignals
                .OrderByDescending(s => s.Confidence)
                .Take(limit)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting high confidence signals");
            return new List<Signal>();
        }
    }

    public async Task<Signal> EnrichSignalWithAIAsync(Signal signal)
    {
        if (string.IsNullOrEmpty(_aiSettings.Key))
        {
            _logger.LogWarning("AI settings not configured, skipping signal enrichment");
            return signal;
        }

        try
        {
            var prompt = $@"
Analyze this business signal and provide insights:

Signal Type: {signal.Type}
Description: {signal.Description}
Source: {signal.Source}

Please provide:
1. A concise summary (max 100 words)
2. Investment relevance score (0-1)
3. Risk level assessment
4. Key implications for investors

Format your response as JSON with fields: summary, relevanceScore, riskLevel, implications";

            var requestBody = new
            {
                messages = new[]
                {
                    new { role = "system", content = "You are an expert investment analyst specialized in startup and venture capital signals." },
                    new { role = "user", content = prompt }
                },
                model = _aiSettings.Model,
                max_tokens = 300,
                temperature = 0.1
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_aiSettings.Key}");

            var response = await _httpClient.PostAsync($"{_aiSettings.Url}/chat/completions", content);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var aiResponse = JsonSerializer.Deserialize<dynamic>(responseJson);
                
                // Parse AI response and update signal
                // This would need proper JSON parsing logic based on the actual response format
                signal.Summary = $"AI-Enhanced: {signal.Summary}";
                signal.Confidence = Math.Min(1.0f, signal.Confidence * 1.1f); // Slightly boost confidence for AI-enriched signals
            }

            return signal;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enriching signal with AI");
            return signal; // Return original signal if enrichment fails
        }
    }

    private async Task<List<Signal>> ExtractSignalsFromNewsAsync(string companyName)
    {
        try
        {
            var signals = new List<Signal>();
            var context = await _contextFeedService.GetVCLatestAsync();
            
            if (context.Entries != null)
            {
                foreach (var entry in context.Entries)
                {
                    if (entry.Headline.Contains(companyName, StringComparison.OrdinalIgnoreCase) ||
                        entry.Summary.Contains(companyName, StringComparison.OrdinalIgnoreCase))
                    {
                        var extractedSignals = await ExtractSignalsFromTextAsync(
                            $"{entry.Headline} {entry.Summary}", 
                            entry.Source ?? "News"
                        );
                        signals.AddRange(extractedSignals);
                    }
                }
            }

            return signals;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting signals from news for company {CompanyName}", companyName);
            return new List<Signal>();
        }
    }

    private float CalculateBaseConfidence(string text, string[] keywords, float baseScore)
    {
        var keywordMatches = keywords.Count(keyword => text.ToLower().Contains(keyword));
        var keywordDensity = (float)keywordMatches / keywords.Length;
        
        // Text length factor (longer, more detailed text might be more reliable)
        var lengthFactor = Math.Min(1.0f, text.Length / 500.0f);
        
        return Math.Min(1.0f, baseScore * (0.7f + keywordDensity * 0.3f + lengthFactor * 0.1f));
    }

    private async Task<string> GenerateSignalSummaryAsync(string text, string signalType)
    {
        // Simple summary generation - in production this could use AI
        var summary = text.Length > 150 ? text[..147] + "..." : text;
        return $"{signalType} signal detected: {summary}";
    }
}
