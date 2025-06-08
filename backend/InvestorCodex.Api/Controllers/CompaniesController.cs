using InvestorCodex.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    // Sample data for demonstration
    private static readonly List<Company> Companies = new()
    {        new Company
        {
            Id = Guid.NewGuid(),
            Name = "TechCorp Solutions",
            Domain = "techcorp.com",
            Industry = "Software",
            Location = "San Francisco, CA",
            Headcount = 250,
            FundingStage = "Series B",
            Summary = "Leading provider of enterprise software solutions with AI-driven analytics",
            InvestmentScore = 8.5f,
            Tags = new[] { "AI", "Enterprise", "SaaS", "High-Growth" },
            RiskFlags = new[] { "Market Competition" }
        },
        new Company
        {
            Id = Guid.NewGuid(),
            Name = "GreenTech Industries",
            Domain = "greentech.com",
            Industry = "Clean Energy",
            Location = "Austin, TX",
            Headcount = 180,
            FundingStage = "Series A",
            Summary = "Innovative clean energy solutions focusing on solar and wind power technology",
            InvestmentScore = 7.8f,
            Tags = new[] { "Clean Energy", "Solar", "Wind", "Sustainability" },
            RiskFlags = new[] { "Regulatory Risk", "Capital Intensive" }
        },
        new Company
        {
            Id = Guid.NewGuid(),
            Name = "BioMed Innovations",
            Domain = "biomed.com",
            Industry = "Biotechnology",
            Location = "Boston, MA",
            Headcount = 85,
            FundingStage = "Seed",
            Summary = "Cutting-edge biotechnology company developing novel therapeutic treatments",
            InvestmentScore = 9.1f,
            Tags = new[] { "Biotech", "Pharmaceuticals", "R&D", "Clinical Trials" },
            RiskFlags = new[] { "FDA Approval Risk", "Long Development Cycles" }
        }
    };    [HttpGet]
    public ActionResult<PaginatedResponse<Company>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string[]? industry = null,
        [FromQuery] string[]? fundingStage = null,
        [FromQuery] float? investmentScoreMin = null,
        [FromQuery] float? investmentScoreMax = null,
        [FromQuery] string[]? tags = null)
    {
        var query = Companies.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => 
                (c.Name != null && c.Name.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (c.Industry != null && c.Industry.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (c.Summary != null && c.Summary.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (industry != null && industry.Length > 0)
        {
            query = query.Where(c => c.Industry != null && industry.Contains(c.Industry));
        }

        if (fundingStage != null && fundingStage.Length > 0)
        {
            query = query.Where(c => c.FundingStage != null && fundingStage.Contains(c.FundingStage));
        }

        if (investmentScoreMin.HasValue)
        {
            query = query.Where(c => c.InvestmentScore >= investmentScoreMin.Value);
        }

        if (investmentScoreMax.HasValue)
        {
            query = query.Where(c => c.InvestmentScore <= investmentScoreMax.Value);
        }

        if (tags != null && tags.Length > 0)
        {
            query = query.Where(c => c.Tags.Any(t => tags.Contains(t)));
        }

        var total = query.Count();
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);

        var companies = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var response = new PaginatedResponse<Company>
        {
            Data = companies,
            Page = page,
            PageSize = pageSize,
            Total = total,
            TotalPages = totalPages
        };

        return Ok(response);
    }

    [HttpGet("{id}")]
    public ActionResult<Company> GetById(Guid id)
    {
        var company = Companies.FirstOrDefault(c => c.Id == id);
        if (company == null)
        {
            return NotFound($"Company with ID {id} not found");
        }
        return Ok(company);
    }

    [HttpPost]
    public ActionResult<Company> Post([FromBody] Company company)
    {
        company.Id = Guid.NewGuid();
        Companies.Add(company);
        return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
    }

    [HttpPut("{id}")]
    public ActionResult<Company> Put(Guid id, [FromBody] Company company)
    {
        var existingCompany = Companies.FirstOrDefault(c => c.Id == id);
        if (existingCompany == null)
        {
            return NotFound($"Company with ID {id} not found");
        }

        // Update properties
        existingCompany.Name = company.Name;
        existingCompany.Industry = company.Industry;
        existingCompany.Location = company.Location;
        existingCompany.Summary = company.Summary;
        existingCompany.InvestmentScore = company.InvestmentScore;
        existingCompany.Tags = company.Tags;
        existingCompany.RiskFlags = company.RiskFlags;

        return Ok(existingCompany);
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(Guid id)
    {
        var company = Companies.FirstOrDefault(c => c.Id == id);
        if (company == null)
        {
            return NotFound($"Company with ID {id} not found");
        }

        Companies.Remove(company);
        return NoContent();
    }

    [HttpGet("{id}/contacts")]
    public ActionResult<List<Contact>> GetCompanyContacts(Guid id)
    {
        var company = Companies.FirstOrDefault(c => c.Id == id);
        if (company == null)
        {
            return NotFound($"Company with ID {id} not found");
        }

        // Mock contacts data - would come from database in real implementation
        var contacts = new List<Contact>
        {
            new Contact
            {
                Id = Guid.NewGuid(),
                CompanyId = id,
                Name = "Sarah Chen",
                Title = "Chief Technology Officer",
                Email = "s.chen@" + company.Domain,
                LinkedInUrl = "https://linkedin.com/in/sarahchen",
                Persona = "Technical Leader",
                Summary = "Experienced CTO with expertise in AI and machine learning systems."
            },
            new Contact
            {
                Id = Guid.NewGuid(),
                CompanyId = id,
                Name = "Michael Rodriguez",
                Title = "VP of Engineering",
                Email = "m.rodriguez@" + company.Domain,
                LinkedInUrl = "https://linkedin.com/in/michaelrodriguez",
                Persona = "Engineering Leader",
                Summary = "Veteran engineering leader with background in scaling enterprise software."
            }
        };

        return Ok(contacts);
    }

    [HttpGet("{id}/investments")]
    public ActionResult<List<Investment>> GetCompanyInvestments(Guid id)
    {
        var company = Companies.FirstOrDefault(c => c.Id == id);
        if (company == null)
        {
            return NotFound($"Company with ID {id} not found");
        }

        // Mock investment data
        var investments = new List<Investment>
        {
            new Investment
            {
                Id = Guid.NewGuid(),
                CompanyId = id,
                Company = company.Name,
                Round = company.FundingStage,
                Amount = company.FundingStage == "Series B" ? 25000000 : 
                        company.FundingStage == "Series A" ? 15000000 : 5000000,
                Currency = "USD",
                FilingDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 180)),
                Source = "SEC EDGAR",
                FilingType = company.FundingStage,
                Summary = $"{company.FundingStage} funding round to accelerate growth and expansion.",
                InvestmentScore = company.InvestmentScore
            }
        };

        return Ok(investments);
    }

    [HttpGet("{id}/signals")]
    public ActionResult<List<Signal>> GetCompanySignals(Guid id)
    {
        var company = Companies.FirstOrDefault(c => c.Id == id);
        if (company == null)
        {
            return NotFound($"Company with ID {id} not found");
        }

        // Mock signals data
        var signals = new List<Signal>
        {
            new Signal
            {
                Id = Guid.NewGuid(),
                CompanyId = id,
                Type = "funding",
                Title = $"New {company.FundingStage} Funding Round",
                Description = $"{company.Name} announced new funding to accelerate growth.",
                Source = "TechCrunch",
                Severity = "high",
                Tags = new[] { "funding", "growth" },
                Summary = "Significant funding milestone indicating strong growth trajectory.",
                DetectedAt = DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 48)),
                ProcessedAt = DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 47))
            },
            new Signal
            {
                Id = Guid.NewGuid(),
                CompanyId = id,
                Type = "hiring",
                Title = "Major Hiring Initiative",
                Description = $"{company.Name} posted multiple new positions across engineering and sales.",
                Source = "LinkedIn Jobs",
                Severity = "medium",
                Tags = new[] { "hiring", "expansion" },
                Summary = "Rapid hiring suggests scaling of operations.",
                DetectedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 7)),
                ProcessedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 6))
            }
        };

        return Ok(signals);
    }

    [HttpGet("{id}/similar")]
    public ActionResult<List<SimilarCompany>> GetSimilarCompanies(Guid id, [FromQuery] int limit = 10)
    {
        var company = Companies.FirstOrDefault(c => c.Id == id);
        if (company == null)
        {
            return NotFound($"Company with ID {id} not found");
        }

        // Mock similar companies - would use AI embeddings in real implementation
        var similarCompanies = Companies
            .Where(c => c.Id != id && c.Industry == company.Industry)
            .Take(limit)
            .Select(c => new SimilarCompany
            {
                Id = c.Id,
                Name = c.Name,
                Domain = c.Domain,
                Industry = c.Industry,
                Similarity = 0.85f + (float)(Random.Shared.NextDouble() * 0.14), // Mock similarity score
                Summary = c.Summary,
                InvestmentScore = c.InvestmentScore
            })
            .OrderByDescending(c => c.Similarity)
            .ToList();

        return Ok(similarCompanies);
    }
}

