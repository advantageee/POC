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
    private readonly IContactRepository _contactRepository;
    private readonly IInvestmentRepository _investmentRepository;
    private readonly ISignalRepository _signalRepository;

    public CompaniesController(
        ICompanyRepository companyRepository, 
        IApolloService apolloService, 
        ILogger<CompaniesController> logger,
        IContactRepository contactRepository,
        IInvestmentRepository investmentRepository,
        ISignalRepository signalRepository)
    {
        _companyRepository = companyRepository;
        _apolloService = apolloService;
        _logger = logger;
        _contactRepository = contactRepository;
        _investmentRepository = investmentRepository;
        _signalRepository = signalRepository;
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
    {        try
        {
            // Use Apollo service which handles Apollo.io prioritization and database fallback internally
            _logger.LogInformation("Fetching companies via Apollo service");
            var result = await _apolloService.GetCompaniesAsync(page, pageSize, search);
            
            // Apply additional filters that Apollo service doesn't handle
            if (industry != null || fundingStage != null || investmentScoreMin != null || investmentScoreMax != null || tags != null)
            {
                _logger.LogInformation("Additional filters detected, applying post-processing to Apollo results");
                
                var filteredData = result.Data.AsEnumerable();
                
                if (industry != null && industry.Length > 0)
                    filteredData = filteredData.Where(c => industry.Contains(c.Industry));
                    
                if (fundingStage != null && fundingStage.Length > 0)
                    filteredData = filteredData.Where(c => fundingStage.Contains(c.FundingStage));
                    
                if (investmentScoreMin.HasValue)
                    filteredData = filteredData.Where(c => c.InvestmentScore >= investmentScoreMin.Value);
                    
                if (investmentScoreMax.HasValue)
                    filteredData = filteredData.Where(c => c.InvestmentScore <= investmentScoreMax.Value);
                    
                if (tags != null && tags.Length > 0)
                    filteredData = filteredData.Where(c => c.Tags?.Any(tag => tags.Contains(tag)) == true);
                
                var filteredList = filteredData.ToList();
                result.Data = filteredList;
                result.Total = filteredList.Count;
                result.TotalPages = (int)Math.Ceiling((double)filteredList.Count / pageSize);
            }
            
            _logger.LogInformation("Returning {Count} companies", result.Data.Count);
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

    [HttpGet("{id}/contacts")]
    public async Task<ActionResult<List<Contact>>> GetCompanyContacts(Guid id)
    {
        try
        {
            // First verify the company exists
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company == null)
            {
                return NotFound($"Company with ID {id} not found");
            }

            // Get contacts for this company
            var contactsResult = await _contactRepository.GetContactsAsync(
                page: 1, 
                pageSize: 1000, 
                search: null, 
                companyId: id, 
                personas: null);
                
            return Ok(contactsResult.Data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching company contacts: {ex.Message}");
        }
    }

    [HttpGet("{id}/investments")]
    public async Task<ActionResult<List<Investment>>> GetCompanyInvestments(Guid id)
    {
        try
        {
            // First verify the company exists
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company == null)
            {
                return NotFound($"Company with ID {id} not found");
            }

            // Get investments for this company
            var investmentsResult = await _investmentRepository.GetInvestmentsAsync(
                page: 1,
                pageSize: 1000,
                search: null,
                companyId: id,
                rounds: null,
                minAmount: null,
                maxAmount: null);

            return Ok(investmentsResult.Data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching company investments: {ex.Message}");
        }
    }    [HttpGet("{id}/signals")]
    public async Task<ActionResult<List<Signal>>> GetCompanySignals(Guid id)
    {
        try
        {
            // First verify the company exists
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company == null)
            {
                return NotFound($"Company with ID {id} not found");
            }

            // Get signals for this company
            var signalsResult = await _signalRepository.GetSignalsAsync(
                page: 1,
                pageSize: 1000,
                search: null,
                companyId: id,
                types: null,
                severities: null);

            return Ok(signalsResult.signals);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching company signals: {ex.Message}");
        }
    }
}
