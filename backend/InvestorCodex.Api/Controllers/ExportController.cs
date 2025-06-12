using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportJobService _exportJobService;

    public ExportController(IExportJobService exportJobService)
    {
        _exportJobService = exportJobService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExportJob>>> Get()
    {
        var jobs = await _exportJobService.GetJobsAsync();
        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExportJob>> GetById(Guid id)
    {
        var job = await _exportJobService.GetJobAsync(id);
        if (job == null)
            return NotFound();
        return Ok(job);
    }

    [HttpPost("companies")]
    public async Task<ActionResult<ExportJob>> ExportCompanies([FromBody] ExportRequest exportRequest)
    {
        exportRequest.Type = "companies";
        var job = await _exportJobService.EnqueueExportAsync(exportRequest);
        return AcceptedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPost("contacts")]
    public async Task<ActionResult<ExportJob>> ExportContacts([FromBody] ExportRequest exportRequest)
    {
        exportRequest.Type = "contacts";
        var job = await _exportJobService.EnqueueExportAsync(exportRequest);
        return AcceptedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPost("investments")]
    public async Task<ActionResult<ExportJob>> ExportInvestments([FromBody] ExportRequest exportRequest)
    {
        exportRequest.Type = "investments";
        var job = await _exportJobService.EnqueueExportAsync(exportRequest);
        return AcceptedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var removed = await _exportJobService.DeleteJobAsync(id);
        if (!removed)
            return NotFound();
        return NoContent();
    }
}
