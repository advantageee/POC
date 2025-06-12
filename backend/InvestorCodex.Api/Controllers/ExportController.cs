using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet]
    [HttpGet("jobs")]
    public async Task<ActionResult<List<ExportJob>>> Get()
    {
        var jobs = await _exportService.GetJobsAsync();
        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExportJob>> GetById(Guid id)
    {
        var job = await _exportService.GetJobAsync(id);
        if (job == null)
        {
            return NotFound();
        }
        return Ok(job);
    }

    [HttpPost("companies")]
    public async Task<ActionResult<ExportJob>> ExportCompanies([FromBody] ExportRequest exportRequest)
    {
        exportRequest.Type = "companies";
        var job = await _exportService.QueueExportAsync(exportRequest);
        return Ok(job);
    }

    [HttpPost("contacts")]
    public async Task<ActionResult<ExportJob>> ExportContacts([FromBody] ExportRequest exportRequest)
    {
        exportRequest.Type = "contacts";
        var job = await _exportService.QueueExportAsync(exportRequest);
        return Ok(job);
    }

    [HttpPost("investments")]
    public async Task<ActionResult<ExportJob>> ExportInvestments([FromBody] ExportRequest exportRequest)
    {
        exportRequest.Type = "investments";
        var job = await _exportService.QueueExportAsync(exportRequest);
        return Ok(job);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var removed = await _exportService.DeleteJobAsync(id);
        if (!removed)
        {
            return NotFound();
        }
        return NoContent();
    }
}
