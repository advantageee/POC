using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignalsController : ControllerBase
{
    // Mock data for development - will be replaced with database
    private readonly List<Signal> _signals = new()
    {
        new Signal
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Type = "funding",
            Title = "Series C Funding Round Announced",
            Description = "TechCorp AI announced a $50M Series C funding round led by top-tier VC firm.",
            Source = "TechCrunch",
            Url = "https://techcrunch.com/funding-news",
            Severity = "high",
            Tags = new[] { "funding", "growth", "venture-capital" },
            Summary = "Significant funding milestone indicating strong growth trajectory.",
            DetectedAt = DateTime.UtcNow.AddHours(-2),
            ProcessedAt = DateTime.UtcNow.AddHours(-1)
        },
        new Signal
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Type = "hiring",
            Title = "Major Hiring Spree in Engineering",
            Description = "GreenTech Solutions posted 25 new engineering positions across multiple departments.",
            Source = "LinkedIn Jobs",
            Url = "https://linkedin.com/jobs/greentech",
            Severity = "medium",
            Tags = new[] { "hiring", "expansion", "engineering" },
            Summary = "Rapid expansion suggests scaling of operations and product development.",
            DetectedAt = DateTime.UtcNow.AddHours(-5),
            ProcessedAt = DateTime.UtcNow.AddHours(-4)
        },
        new Signal
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Type = "partnership",
            Title = "Strategic Partnership with Big Pharma",
            Description = "BioMed Innovations announced partnership with major pharmaceutical company for drug development.",
            Source = "Bloomberg",
            Url = "https://bloomberg.com/partnership-news",
            Severity = "high",
            Tags = new[] { "partnership", "pharma", "strategic" },
            Summary = "High-value partnership signals validation of technology and market potential.",
            DetectedAt = DateTime.UtcNow.AddHours(-8),
            ProcessedAt = DateTime.UtcNow.AddHours(-7)
        },
        new Signal
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Type = "product",
            Title = "New AI Product Launch",
            Description = "TechCorp AI launched new machine learning platform for enterprise customers.",
            Source = "Company Press Release",
            Url = "https://techcorp.com/press/ai-platform-launch",
            Severity = "medium",
            Tags = new[] { "product-launch", "ai", "enterprise" },
            Summary = "Product diversification shows continued innovation and market expansion.",
            DetectedAt = DateTime.UtcNow.AddDays(-1),
            ProcessedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(30)
        },
        new Signal
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Type = "risk",
            Title = "Regulatory Investigation Announced",
            Description = "Environmental regulatory body announced investigation into GreenTech's new facility.",
            Source = "Reuters",
            Url = "https://reuters.com/regulatory-investigation",
            Severity = "high",
            Tags = new[] { "regulatory", "risk", "investigation" },
            Summary = "Regulatory scrutiny poses potential operational and reputational risks.",
            DetectedAt = DateTime.UtcNow.AddDays(-2),
            ProcessedAt = DateTime.UtcNow.AddDays(-2).AddHours(1)
        }
    };

    [HttpGet]
    public ActionResult<PaginatedResponse<object>> GetSignals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? severity = null,
        [FromQuery] string[]? type = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var query = _signals.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(s => 
                (s.Title != null && s.Title.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (s.Description != null && s.Description.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (s.Source != null && s.Source.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (companyId.HasValue)
        {
            query = query.Where(s => s.CompanyId == companyId.Value);
        }

        if (severity != null && severity.Length > 0)
        {
            query = query.Where(s => severity.Contains(s.Severity));
        }

        if (type != null && type.Length > 0)
        {
            query = query.Where(s => s.Type != null && type.Contains(s.Type));
        }

        if (dateFrom.HasValue)
        {
            query = query.Where(s => s.DetectedAt >= dateFrom.Value);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(s => s.DetectedAt <= dateTo.Value);
        }

        var total = query.Count();
        var totalPages = (int)Math.Ceiling((double)total / pageSize);
        var signals = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderByDescending(s => s.DetectedAt)
            .ToList();

        // Create signals with company info for the response
        var signalsWithCompany = signals.Select(s => new
        {
            s.Id,
            s.CompanyId,
            s.Type,
            s.Title,
            s.Description,
            s.Source,
            s.Url,
            s.Severity,
            s.Tags,
            s.Summary,
            s.DetectedAt,
            s.ProcessedAt,
            Company = new
            {
                Id = s.CompanyId,
                Name = GetCompanyName(s.CompanyId),
                Domain = GetCompanyDomain(s.CompanyId)
            }
        }).ToList();

        return Ok(new PaginatedResponse<object>
        {
            Data = signalsWithCompany.Cast<object>().ToList(),
            Page = page,
            PageSize = pageSize,
            Total = total,
            TotalPages = totalPages
        });
    }

    [HttpGet("{id}")]
    public ActionResult<Signal> GetSignal(Guid id)
    {
        var signal = _signals.FirstOrDefault(s => s.Id == id);
        if (signal == null)
        {
            return NotFound();
        }
        return Ok(signal);
    }

    [HttpPost]
    public ActionResult<Signal> CreateSignal([FromBody] Signal signal)
    {
        signal.Id = Guid.NewGuid();
        signal.DetectedAt = DateTime.UtcNow;
        signal.ProcessedAt = DateTime.UtcNow;
        _signals.Add(signal);
        return CreatedAtAction(nameof(GetSignal), new { id = signal.Id }, signal);
    }

    [HttpPut("{id}")]
    public ActionResult<Signal> UpdateSignal(Guid id, [FromBody] Signal signal)
    {
        var existingSignal = _signals.FirstOrDefault(s => s.Id == id);
        if (existingSignal == null)
        {
            return NotFound();
        }

        existingSignal.Type = signal.Type;
        existingSignal.Title = signal.Title;
        existingSignal.Description = signal.Description;
        existingSignal.Source = signal.Source;
        existingSignal.Url = signal.Url;
        existingSignal.Severity = signal.Severity;
        existingSignal.Tags = signal.Tags;
        existingSignal.Summary = signal.Summary;
        existingSignal.ProcessedAt = DateTime.UtcNow;

        return Ok(existingSignal);
    }

    [HttpPut("{id}/read")]
    public ActionResult MarkAsRead(Guid id)
    {
        var signal = _signals.FirstOrDefault(s => s.Id == id);
        if (signal == null)
        {
            return NotFound();
        }

        // This would typically update a read status flag
        // For now, we'll just return success
        return Ok();
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteSignal(Guid id)
    {
        var signal = _signals.FirstOrDefault(s => s.Id == id);
        if (signal == null)
        {
            return NotFound();
        }

        _signals.Remove(signal);
        return NoContent();
    }

    // Helper methods to get company info - would come from database in real implementation
    private string GetCompanyName(Guid companyId)
    {
        return companyId.ToString() switch
        {
            "11111111-1111-1111-1111-111111111111" => "TechCorp AI",
            "22222222-2222-2222-2222-222222222222" => "GreenTech Solutions",
            "33333333-3333-3333-3333-333333333333" => "BioMed Innovations",
            _ => "Unknown Company"
        };
    }

    private string GetCompanyDomain(Guid companyId)
    {
        return companyId.ToString() switch
        {
            "11111111-1111-1111-1111-111111111111" => "techcorp.com",
            "22222222-2222-2222-2222-222222222222" => "greentech.com",
            "33333333-3333-3333-3333-333333333333" => "biomed.com",
            _ => "unknown.com"
        };
    }
}
