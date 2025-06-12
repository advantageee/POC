using System.Net;
using System.Text.Json;
using Azure;
using Azure.AI.OpenAI;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using InvestorCodex.EnrichmentFunction.Models;

namespace InvestorCodex.EnrichmentFunction;

/// <summary>
/// Azure Functions that enrich company and signal data using Azure OpenAI.
/// Actual calls to GPT-4o and embeddings are left as TODOs.
/// </summary>
public class EnrichmentFunctions
{
    private readonly ILogger _logger;
    private readonly OpenAIClient? _openAiClient;
    private readonly string _model;

    public EnrichmentFunctions(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<EnrichmentFunctions>();
        var endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT");
        var key = Environment.GetEnvironmentVariable("AZURE_OPENAI_KEY");
        _model = Environment.GetEnvironmentVariable("AZURE_OPENAI_MODEL") ?? "gpt-4o";

        if (!string.IsNullOrEmpty(endpoint) && !string.IsNullOrEmpty(key))
        {
            _openAiClient = new OpenAIClient(new Uri(endpoint), new AzureKeyCredential(key));
        }
        else
        {
            _logger.LogWarning("Azure OpenAI credentials not configured; using mock responses.");
        }
    }

    [Function("EnrichCompany")]
    public async Task<HttpResponseData> EnrichCompany(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "enrich/company")] HttpRequestData req)
    {
        var payload = await JsonSerializer.DeserializeAsync<CompanyPayload>(req.Body) ?? new CompanyPayload();

        CompanyEnrichment enriched = new();
        try
        {
            if (_openAiClient != null)
            {
                var options = new ChatCompletionsOptions
                {
                    Temperature = 0.1f
                };

                options.Messages.Add(new ChatMessage(ChatRole.System,
                    "You are an investment research assistant. Return concise JSON with fields: summary, investmentScore (0-1), tags, riskFlags."));

                var userContent = $"Name: {payload.Name}\nIndustry: {payload.Industry}\nData: {payload.RawJson}";
                options.Messages.Add(new ChatMessage(ChatRole.User, userContent));

                var result = await _openAiClient.GetChatCompletionsAsync(_model, options);
                var content = result.Value.Choices[0].Message.Content;

                enriched = JsonSerializer.Deserialize<CompanyEnrichment>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new CompanyEnrichment { Summary = content };
            }
            else
            {
                enriched = new CompanyEnrichment { Summary = "Azure OpenAI not configured" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enrich company via OpenAI");
            enriched = new CompanyEnrichment { Summary = payload.RawJson };
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(enriched);
        return response;
    }

    [Function("EnrichInvestmentSummary")]
    public async Task<HttpResponseData> EnrichInvestmentSummary(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "enrich/investment-summary")] HttpRequestData req)
    {
        var payload = await JsonSerializer.DeserializeAsync<InvestmentSummaryPayload>(req.Body) ?? new InvestmentSummaryPayload();

        InvestmentSummaryResult enriched = new();
        try
        {
            if (_openAiClient != null)
            {
                var options = new ChatCompletionsOptions { Temperature = 0.1f };
                options.Messages.Add(new ChatMessage(ChatRole.System,
                    "Summarize the following investment information. Return JSON with fields: summary and investmentScore (0-1)."));
                options.Messages.Add(new ChatMessage(ChatRole.User, payload.RawJson ?? string.Empty));

                var result = await _openAiClient.GetChatCompletionsAsync(_model, options);
                var content = result.Value.Choices[0].Message.Content;

                enriched = JsonSerializer.Deserialize<InvestmentSummaryResult>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new InvestmentSummaryResult { Summary = content };
            }
            else
            {
                enriched = new InvestmentSummaryResult { Summary = "Azure OpenAI not configured" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enrich investment summary via OpenAI");
            enriched = new InvestmentSummaryResult { Summary = payload.RawJson };
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(enriched);
        return response;
    }

    [Function("AnalyzeSignal")]
    public async Task<HttpResponseData> AnalyzeSignal(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "analyze/signal")] HttpRequestData req)
    {
        var payload = await JsonSerializer.DeserializeAsync<SignalPayload>(req.Body) ?? new SignalPayload();

        SignalAnalysis enriched = new();
        try
        {
            if (_openAiClient != null)
            {
                var options = new ChatCompletionsOptions { Temperature = 0.2f };
                options.Messages.Add(new ChatMessage(ChatRole.System,
                    "Analyze the following business signal. Return JSON with fields: summary, severity (low, medium, high), tags."));
                options.Messages.Add(new ChatMessage(ChatRole.User, payload.Text ?? string.Empty));

                var result = await _openAiClient.GetChatCompletionsAsync(_model, options);
                var content = result.Value.Choices[0].Message.Content;

                enriched = JsonSerializer.Deserialize<SignalAnalysis>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new SignalAnalysis { Summary = content };
            }
            else
            {
                enriched = new SignalAnalysis { Summary = "Azure OpenAI not configured", Severity = "low" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze signal via OpenAI");
            enriched = new SignalAnalysis { Summary = payload.Text };
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(enriched);
        return response;
    }
}
