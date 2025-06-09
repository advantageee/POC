using InvestorCodex.Api.Data;
using InvestorCodex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IContactRepository _contactRepository;
    private readonly IApolloService _apolloService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        ICompanyRepository companyRepository,
        IContactRepository contactRepository,
        IApolloService apolloService,
        ILogger<AdminController> logger)
    {
        _companyRepository = companyRepository;
        _contactRepository = contactRepository;
        _apolloService = apolloService;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetSystemStats()
    {
        try
        {
            var companies = await _companyRepository.GetCompaniesAsync(1, 1000);
            var contacts = await _contactRepository.GetContactsAsync(1, 1000);

            return Ok(new
            {
                database = new
                {
                    companiesCount = companies.Total,
                    contactsCount = contacts.Total,
                    lastUpdated = DateTime.UtcNow
                },
                apollo = new
                {
                    status = "Connected",
                    optimizationEnabled = true,
                    databaseFirst = true,
                    investorFocused = true
                },
                features = new
                {
                    smartSync = "Available",
                    bulkLoad = "Available",
                    intelligentQuerying = "Enabled",
                    duplicateDetection = "Enabled"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system stats");
            return StatusCode(500, new { error = "Failed to get system stats", message = ex.Message });
        }
    }

    [HttpPost("apollo/sync")]
    public async Task<ActionResult> TriggerApolloSync([FromQuery] int maxPages = 3)
    {
        try
        {
            _logger.LogInformation("Admin triggered Apollo sync with maxPages: {MaxPages}", maxPages);
            var result = await _apolloService.SyncCompaniesWithDatabaseAsync(maxPages);
            
            var statsAfter = await GetSystemStatsData();
            
            return Ok(new
            {
                message = result ? "Apollo sync completed successfully" : "Apollo sync completed but no new data found",
                maxPages,
                systemStats = statsAfter,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during admin Apollo sync");
            return StatusCode(500, new { error = "Apollo sync failed", message = ex.Message });
        }
    }

    [HttpPost("apollo/bulk-load")]
    public async Task<ActionResult> TriggerBulkLoad()
    {
        try
        {
            _logger.LogInformation("Admin triggered Apollo bulk load");
            
            // Run both operations
            var companiesTask = _apolloService.LoadAllCompaniesFromApolloAsync();
            var contactsTask = _apolloService.LoadAllContactsFromApolloAsync();
            
            var companiesLoaded = await companiesTask;
            var contactsLoaded = await contactsTask;
            
            var statsAfter = await GetSystemStatsData();
            
            return Ok(new
            {
                message = "Apollo bulk load completed",
                companiesLoaded,
                contactsLoaded,
                totalLoaded = companiesLoaded + contactsLoaded,
                systemStats = statsAfter,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Apollo bulk load");
            return StatusCode(500, new { error = "Apollo bulk load failed", message = ex.Message });
        }
    }

    [HttpGet("apollo/test")]
    public async Task<ActionResult> TestApolloConnection()
    {
        try
        {
            _logger.LogInformation("Testing Apollo connection");
            
            // Test with a simple query
            var testResult = await _apolloService.GetCompaniesAsync(1, 5, "technology");
            
            return Ok(new
            {
                status = "Connection successful",
                companiesReturned = testResult.Data?.Count ?? 0,
                dataSource = testResult.Data?.Any() == true ? "Apollo API" : "Database fallback",
                apolloTotal = testResult.Total,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing Apollo connection");
            return StatusCode(500, new { error = "Apollo connection test failed", message = ex.Message });
        }
    }

    private async Task<object> GetSystemStatsData()
    {
        var companies = await _companyRepository.GetCompaniesAsync(1, 1000);
        var contacts = await _contactRepository.GetContactsAsync(1, 1000);

        return new
        {
            companiesCount = companies.Total,
            contactsCount = contacts.Total,
            lastUpdated = DateTime.UtcNow
        };
    }
}
