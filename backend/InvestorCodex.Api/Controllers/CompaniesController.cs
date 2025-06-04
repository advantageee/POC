using InvestorCodex.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    // In-memory list to illustrate concept
    private static readonly List<Company> Companies = new();

    [HttpGet]
    public ActionResult<IEnumerable<Company>> Get() => Companies;

    [HttpPost]
    public ActionResult<Company> Post([FromBody] Company company)
    {
        company.Id = Guid.NewGuid();
        Companies.Add(company);
        return CreatedAtAction(nameof(Get), new { id = company.Id }, company);
    }
}

