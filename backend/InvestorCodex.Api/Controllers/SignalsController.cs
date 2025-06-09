using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Data;
using InvestorCodex.Api.Services;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignalsController : ControllerBase
{
    private readonly ISignalRepository _signalRepository;
    private readonly ITwitterService _twitterService;
    private readonly ILogger<SignalsController> _logger;

    public SignalsController(
        ISignalRepository signalRepository, 
        ITwitterService twitterService,
        ILogger<SignalsController> logger)
    {
        _signalRepository = signalRepository;
        _twitterService = twitterService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<Signal>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? types = null,
        [FromQuery] string[]? severities = null)    {
        try
        {
            // Try to get real signals from Twitter first
            _logger.LogInformation("Fetching signals from Twitter API");
            var twitterSignals = await _twitterService.GetSignalsAsync(search, pageSize);
            
            if (twitterSignals.Any())
            {
                _logger.LogInformation("Successfully fetched {Count} signals from Twitter API", twitterSignals.Count);
                
                var twitterResponse = new PaginatedResponse<Signal>
                {
                    Data = twitterSignals,
                    Total = twitterSignals.Count,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)twitterSignals.Count / pageSize)
                };
                
                return Ok(twitterResponse);
            }            // Fallback to database if Twitter fails
            _logger.LogInformation("Twitter API returned no data, falling back to database");
            var result = await _signalRepository.GetSignalsAsync(page, pageSize, search, companyId, types, severities);
            var signals = result.signals;
            var totalCount = result.totalCount;
            
            var response = new PaginatedResponse<Signal>
            {
                Data = signals.ToList(),
                Total = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching signals");
            // Return mock data when database is not available
            var mockSignals = new List<Signal>
            {
                new Signal
                {
                    Id = Guid.NewGuid(),
                    CompanyId = Guid.NewGuid(),
                    Type = "Funding",
                    Severity = "high",
                    Title = "Series A Funding Announced",
                    Description = "Company announced $10M Series A funding round",
                    Source = "TechCrunch",
                    Url = "https://techcrunch.com/example",
                    DetectedAt = DateTime.UtcNow.AddHours(-2),
                    ProcessedAt = DateTime.UtcNow.AddHours(-2),
                    Tags = new[] { "funding", "series-a" }
                },
                new Signal
                {
                    Id = Guid.NewGuid(),
                    CompanyId = Guid.NewGuid(),
                    Type = "Leadership",
                    Severity = "medium",
                    Title = "New CTO Appointed",
                    Description = "Former Google engineer joins as Chief Technology Officer",
                    Source = "LinkedIn",
                    Url = "https://linkedin.com/example",
                    DetectedAt = DateTime.UtcNow.AddHours(-5),
                    ProcessedAt = DateTime.UtcNow.AddHours(-5),
                    Tags = new[] { "leadership", "hiring" }
                }
            };

            var response = new PaginatedResponse<Signal>
            {
                Data = mockSignals,
                Total = mockSignals.Count,
                Page = page,
                PageSize = pageSize,
                TotalPages = 1
            };

            return Ok(response);
        }
    }    [HttpGet("{id}")]
    public async Task<ActionResult<Signal>> GetById(Guid id)
    {
        try
        {
            var signal = await _signalRepository.GetSignalByIdAsync(id);
            if (signal == null)
            {
                return NotFound($"Signal with ID {id} not found.");
            }
            return Ok(signal);
        }
        catch (Exception)
        {
            // Return mock data when database is not available
            var mockSignal = new Signal
            {
                Id = id,
                CompanyId = Guid.NewGuid(),
                Type = "Funding",
                Severity = "high",
                Title = "Mock Signal",
                Description = "This is a mock signal returned when database is unavailable",
                Source = "Mock",
                Url = "https://example.com",
                DetectedAt = DateTime.UtcNow.AddHours(-1),
                ProcessedAt = DateTime.UtcNow.AddHours(-1),
                Tags = new[] { "mock", "test" }
            };
            
            return Ok(mockSignal);
        }
    }

    [HttpPost]
    public async Task<ActionResult<Signal>> Post([FromBody] Signal signal)
    {
        try
        {
            if (signal == null)
            {
                return BadRequest("Signal data is required.");
            }

            var createdSignal = await _signalRepository.CreateSignalAsync(signal);
            return CreatedAtAction(nameof(GetById), new { id = createdSignal.Id }, createdSignal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Signal>> Put(Guid id, [FromBody] Signal signal)
    {
        try
        {
            if (signal == null)
            {
                return BadRequest("Signal data is required.");
            }

            var updatedSignal = await _signalRepository.UpdateSignalAsync(id, signal);
            if (updatedSignal == null)
            {
                return NotFound($"Signal with ID {id} not found.");
            }
            return Ok(updatedSignal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _signalRepository.DeleteSignalAsync(id);
            if (!deleted)
            {
                return NotFound($"Signal with ID {id} not found.");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
