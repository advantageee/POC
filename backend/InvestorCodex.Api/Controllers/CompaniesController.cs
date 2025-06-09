using InvestorCodex.Api.Data;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IApolloService _apolloService;
    private readonly ILogger<CompaniesController> _logger;

    public CompaniesController(
        ICompanyRepository companyRepository, 
        IApolloService apolloService, 
        ILogger<CompaniesController> logger)
    {
        _companyRepository = companyRepository;
        _apolloService = apolloService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<Company>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string[]? industry = null,
        [FromQuery] string[]? fundingStage = null,
        [FromQuery] float? investmentScoreMin = null,
        [FromQuery] float? investmentScoreMax = null,
        [FromQuery] string[]? tags = null)
    {
        try
        {
            // Try to get real data from Apollo first
            _logger.LogInformation("Fetching companies from Apollo API");
            var apolloResult = await _apolloService.GetCompaniesAsync(page, pageSize, search);
            
            if (apolloResult.Data.Any())
            {
                _logger.LogInformation("Successfully fetched {Count} companies from Apollo API", apolloResult.Data.Count);
                return Ok(apolloResult);
            }

            // Fallback to database if Apollo fails
            _logger.LogInformation("Apollo API returned no data, falling back to database");
            var result = await _companyRepository.GetCompaniesAsync(
                page, pageSize, search, industry, fundingStage, 
                investmentScoreMin, investmentScoreMax, tags);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching companies: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Company>> GetById(Guid id)
    {
        try
        {
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company == null)
            {
                return NotFound($"Company with ID {id} not found");
            }
            return Ok(company);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching company: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Company>> Post([FromBody] Company company)
    {
        try
        {
            var createdCompany = await _companyRepository.CreateCompanyAsync(company);
            return CreatedAtAction(nameof(GetById), new { id = createdCompany.Id }, createdCompany);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating company: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Company>> Put(Guid id, [FromBody] Company company)
    {
        try
        {
            var updatedCompany = await _companyRepository.UpdateCompanyAsync(id, company);
            if (updatedCompany == null)
            {
                return NotFound($"Company with ID {id} not found");
            }
            return Ok(updatedCompany);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating company: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _companyRepository.DeleteCompanyAsync(id);
            if (!deleted)
            {
                return NotFound($"Company with ID {id} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting company: {ex.Message}");
        }
    }

    [HttpPost("sync-apollo")]
    public async Task<ActionResult> SyncWithApollo([FromQuery] int maxPages = 5)
    {
        try
        {
            _logger.LogInformation("Starting Apollo sync with maxPages: {MaxPages}", maxPages);
            var result = await _apolloService.SyncCompaniesWithDatabaseAsync(maxPages);
            
            if (result)
            {
                return Ok(new { message = "Apollo sync completed successfully", maxPages });
            }
            else
            {
                return Ok(new { message = "Apollo sync completed but no new data was found", maxPages });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Apollo sync");
            return StatusCode(500, new { error = "Apollo sync failed", message = ex.Message });
        }
    }

    [HttpPost("load-all-apollo")]
    public async Task<ActionResult> LoadAllFromApollo()
    {
        try
        {
            _logger.LogInformation("Starting full Apollo data load");
            var companiesLoaded = await _apolloService.LoadAllCompaniesFromApolloAsync();
            var contactsLoaded = await _apolloService.LoadAllContactsFromApolloAsync();
            
            return Ok(new { 
                message = "Apollo bulk load completed", 
                companiesLoaded, 
                contactsLoaded,
                total = companiesLoaded + contactsLoaded
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Apollo bulk load");
            return StatusCode(500, new { error = "Apollo bulk load failed", message = ex.Message });
        }
    }
}
