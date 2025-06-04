using System.Net;
using System.Text.Json;
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

    public EnrichmentFunctions(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<EnrichmentFunctions>();
    }

    [Function("EnrichCompany")]
    public async Task<HttpResponseData> EnrichCompany(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "enrich/company")] HttpRequestData req)
    {
        var payload = await JsonSerializer.DeserializeAsync<CompanyPayload>(req.Body) ?? new CompanyPayload();

        // TODO: Call Azure OpenAI GPT-4o to generate summary, tags and risk flags
        var enriched = new CompanyEnrichment
        {
            Summary = "TODO",
            InvestmentScore = 0,
            Tags = [],
            RiskFlags = []
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(enriched);
        return response;
    }

    [Function("EnrichInvestmentSummary")]
    public async Task<HttpResponseData> EnrichInvestmentSummary(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "enrich/investment-summary")] HttpRequestData req)
    {
        var payload = await JsonSerializer.DeserializeAsync<InvestmentSummaryPayload>(req.Body) ?? new InvestmentSummaryPayload();

        // TODO: Summarize investment data and calculate score
        var enriched = new InvestmentSummaryResult
        {
            Summary = "TODO",
            InvestmentScore = 0
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(enriched);
        return response;
    }

    [Function("AnalyzeSignal")]
    public async Task<HttpResponseData> AnalyzeSignal(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "analyze/signal")] HttpRequestData req)
    {
        var payload = await JsonSerializer.DeserializeAsync<SignalPayload>(req.Body) ?? new SignalPayload();

        // TODO: Analyze signal text and assign severity
        var enriched = new SignalAnalysis
        {
            Tags = [],
            Severity = "low",
            Summary = "TODO"
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(enriched);
        return response;
    }
}
