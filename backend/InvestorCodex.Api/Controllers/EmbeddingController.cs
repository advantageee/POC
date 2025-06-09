using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;
using System.Text.Json;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmbeddingController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmbeddingController> _logger;
    private readonly string _embeddingServiceUrl;

    public EmbeddingController(HttpClient httpClient, ILogger<EmbeddingController> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _embeddingServiceUrl = configuration.GetValue<string>("EmbeddingService:BaseUrl") ?? "http://localhost:8000";
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<SimilarCompany>>> Search(
        [FromQuery] string q,
        [FromQuery] int limit = 10,
        [FromQuery] string? industry = null,
        [FromQuery] string? fundingStage = null)
    {
        try
        {
            var queryParams = $"q={Uri.EscapeDataString(q)}&limit={limit}";
            if (!string.IsNullOrEmpty(industry))
                queryParams += $"&industry={Uri.EscapeDataString(industry)}";
            if (!string.IsNullOrEmpty(fundingStage))
                queryParams += $"&funding_stage={Uri.EscapeDataString(fundingStage)}";

            var response = await _httpClient.GetAsync($"{_embeddingServiceUrl}/api/embedding/search?{queryParams}");
            
            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var searchResults = JsonSerializer.Deserialize<List<SearchResponse>>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var similarCompanies = searchResults?.Select(r => new SimilarCompany
                {
                    Id = Guid.TryParse(r.Id, out var guid) ? guid : Guid.NewGuid(),
                    Name = r.Metadata.TryGetValue("name", out var name) ? name?.ToString() ?? "Unknown" : "Unknown",
                    Industry = r.Metadata.TryGetValue("industry", out var ind) ? ind?.ToString() : null,
                    SimilarityScore = (float)r.Score,
                    Description = r.Text ?? r.Metadata.TryGetValue("description", out var desc) ? desc?.ToString() : null
                }).ToList() ?? new List<SimilarCompany>();

                return Ok(similarCompanies);
            }
            else
            {
                _logger.LogError("Embedding service returned error: {StatusCode}", response.StatusCode);
                return StatusCode(500, "Embedding search service unavailable");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling embedding search service");
            return StatusCode(500, $"An error occurred while searching: {ex.Message}");
        }
    }

    [HttpGet("similar/{companyId}")]
    public async Task<ActionResult<List<SimilarCompany>>> GetSimilarCompanies(Guid companyId, [FromQuery] int limit = 10)
    {
        try
        {
            // For now, we'll use the search endpoint with a company ID
            // In a real implementation, we'd first get the company description and then search
            var response = await _httpClient.GetAsync($"{_embeddingServiceUrl}/api/embedding/search?q=company:{companyId}&limit={limit}");
            
            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var searchResults = JsonSerializer.Deserialize<List<SearchResponse>>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var similarCompanies = searchResults?.Select(r => new SimilarCompany
                {
                    Id = Guid.TryParse(r.Id, out var guid) ? guid : Guid.NewGuid(),
                    Name = r.Metadata.TryGetValue("name", out var name) ? name?.ToString() ?? "Unknown" : "Unknown",
                    Industry = r.Metadata.TryGetValue("industry", out var ind) ? ind?.ToString() : null,
                    SimilarityScore = (float)r.Score,
                    Description = r.Text ?? r.Metadata.TryGetValue("description", out var desc) ? desc?.ToString() : null
                }).ToList() ?? new List<SimilarCompany>();

                return Ok(similarCompanies);
            }
            else
            {
                _logger.LogError("Embedding service returned error: {StatusCode}", response.StatusCode);
                return StatusCode(500, "Embedding search service unavailable");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling embedding service for similar companies");
            return StatusCode(500, $"An error occurred while finding similar companies: {ex.Message}");
        }
    }

    [HttpPost("vectorize")]
    public async Task<ActionResult<object>> VectorizeCompany([FromBody] VectorizeRequest request)
    {
        try
        {
            var requestJson = JsonSerializer.Serialize(request);
            var content = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{_embeddingServiceUrl}/api/embedding/vectorize", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(responseJson));
            }
            else
            {
                _logger.LogError("Embedding service returned error: {StatusCode}", response.StatusCode);
                return StatusCode(500, "Vectorization service unavailable");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling vectorization service");
            return StatusCode(500, $"An error occurred while vectorizing: {ex.Message}");
        }
    }
}

public class VectorizeRequest
{
    public string Text { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class SearchResponse
{
    public string Id { get; set; } = string.Empty;
    public double Score { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
    public string? Text { get; set; }
}
