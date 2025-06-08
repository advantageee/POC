using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvestmentsController : ControllerBase
{
    // Mock data for development - will be replaced with database
    private readonly List<Investment> _investments = new()
    {
        new Investment
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Company = "TechCorp AI",
            Round = "Series B",
            Amount = 25000000,
            Currency = "USD",
            FilingDate = DateTime.UtcNow.AddDays(-45),
            Source = "SEC EDGAR",
            Url = "https://sec.gov/filing/456789",
            FilingType = "Series B",
            Summary = "Series B funding round to expand AI research and development capabilities.",
            InvestmentScore = 82,
            CreatedAt = DateTime.UtcNow.AddDays(-45),
            UpdatedAt = DateTime.UtcNow.AddDays(-10)
        },
        new Investment
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Company = "GreenTech Solutions",
            Round = "Series A",
            Amount = 15000000,
            Currency = "USD",
            FilingDate = DateTime.UtcNow.AddDays(-30),
            Source = "SEDAR",
            Url = "https://sedar.ca/filing/123456",
            FilingType = "Series A",
            Summary = "Series A funding to accelerate clean energy technology deployment.",
            InvestmentScore = 75,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        },
        new Investment
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Company = "BioMed Innovations",
            Round = "Seed",
            Amount = 5000000,
            Currency = "USD",
            FilingDate = DateTime.UtcNow.AddDays(-15),
            Source = "CIRO",
            Url = "https://ciro.ca/filing/789012",
            FilingType = "Seed",
            Summary = "Seed funding for breakthrough medical device development.",
            InvestmentScore = 68,
            CreatedAt = DateTime.UtcNow.AddDays(-15),
            UpdatedAt = DateTime.UtcNow.AddDays(-2)
        }
    };

    [HttpGet]
    public ActionResult<PaginatedResponse<Investment>> GetInvestments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? round = null,
        [FromQuery] decimal? minAmount = null,
        [FromQuery] decimal? maxAmount = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = _investments.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i => 
                (i.Company != null && i.Company.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (i.Round != null && i.Round.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (i.Source != null && i.Source.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (companyId.HasValue)
        {
            query = query.Where(i => i.CompanyId == companyId.Value);
        }

        if (round != null && round.Length > 0)
        {
            query = query.Where(i => i.Round != null && round.Contains(i.Round));
        }

        if (minAmount.HasValue)
        {
            query = query.Where(i => i.Amount >= minAmount.Value);
        }

        if (maxAmount.HasValue)
        {
            query = query.Where(i => i.Amount <= maxAmount.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(i => i.FilingDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(i => i.FilingDate <= toDate.Value);
        }

        var total = query.Count();
        var totalPages = (int)Math.Ceiling((double)total / pageSize);
        var investments = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderByDescending(i => i.FilingDate)
            .ToList();

        return Ok(new PaginatedResponse<Investment>
        {
            Data = investments,
            Page = page,
            PageSize = pageSize,
            Total = total,
            TotalPages = totalPages
        });
    }

    [HttpGet("{id}")]
    public ActionResult<Investment> GetInvestment(Guid id)
    {
        var investment = _investments.FirstOrDefault(i => i.Id == id);
        if (investment == null)
        {
            return NotFound();
        }
        return Ok(investment);
    }

    [HttpPost]
    public ActionResult<Investment> CreateInvestment([FromBody] Investment investment)
    {
        investment.Id = Guid.NewGuid();
        investment.CreatedAt = DateTime.UtcNow;
        investment.UpdatedAt = DateTime.UtcNow;
        _investments.Add(investment);
        return CreatedAtAction(nameof(GetInvestment), new { id = investment.Id }, investment);
    }

    [HttpPut("{id}")]
    public ActionResult<Investment> UpdateInvestment(Guid id, [FromBody] Investment investment)
    {
        var existingInvestment = _investments.FirstOrDefault(i => i.Id == id);
        if (existingInvestment == null)
        {
            return NotFound();
        }

        existingInvestment.Round = investment.Round;
        existingInvestment.Amount = investment.Amount;
        existingInvestment.Currency = investment.Currency;
        existingInvestment.FilingDate = investment.FilingDate;
        existingInvestment.Source = investment.Source;
        existingInvestment.Url = investment.Url;
        existingInvestment.Summary = investment.Summary;
        existingInvestment.InvestmentScore = investment.InvestmentScore;
        existingInvestment.FilingType = investment.FilingType;
        existingInvestment.UpdatedAt = DateTime.UtcNow;

        return Ok(existingInvestment);
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteInvestment(Guid id)
    {
        var investment = _investments.FirstOrDefault(i => i.Id == id);
        if (investment == null)
        {
            return NotFound();
        }

        _investments.Remove(investment);
        return NoContent();
    }
}
