using InvestorCodex.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    // Sample data for demonstration
    private static readonly List<Company> Companies = new()
    {
        new Company
        {
            Id = Guid.NewGuid(),
            Name = "TechCorp Solutions",
            Industry = "Software",
            Location = "San Francisco, CA",
            Summary = "Leading provider of enterprise software solutions with AI-driven analytics",
            InvestmentScore = 8.5f,
            Tags = new[] { "AI", "Enterprise", "SaaS", "High-Growth" },
            RiskFlags = new[] { "Market Competition" }
        },
        new Company
        {
            Id = Guid.NewGuid(),
            Name = "GreenTech Industries",
            Industry = "Clean Energy",
            Location = "Austin, TX",
            Summary = "Innovative clean energy solutions focusing on solar and wind power technology",
            InvestmentScore = 7.8f,
            Tags = new[] { "Clean Energy", "Solar", "Wind", "Sustainability" },
            RiskFlags = new[] { "Regulatory Risk", "Capital Intensive" }
        },
        new Company
        {
            Id = Guid.NewGuid(),
            Name = "BioMed Innovations",
            Industry = "Biotechnology",
            Location = "Boston, MA",
            Summary = "Cutting-edge biotechnology company developing novel therapeutic treatments",
            InvestmentScore = 9.1f,
            Tags = new[] { "Biotech", "Pharmaceuticals", "R&D", "Clinical Trials" },
            RiskFlags = new[] { "FDA Approval Risk", "Long Development Cycles" }
        }
    };

    [HttpGet]
    public ActionResult<IEnumerable<Company>> Get()
    {
        return Ok(Companies);
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
}

