using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    // Mock data for development - will be replaced with Azure Queue and Blob Storage
    private readonly List<ExportJob> _exportJobs = new()
    {
        new ExportJob
        {
            Id = Guid.NewGuid(),
            Status = "completed",
            DownloadUrl = "https://example.com/export/companies.csv",
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            CompletedAt = DateTime.UtcNow.AddHours(-2).AddMinutes(5)
        },
        new ExportJob
        {
            Id = Guid.NewGuid(),
            Status = "processing",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        },
        new ExportJob
        {
            Id = Guid.NewGuid(),
            Status = "failed",
            CreatedAt = DateTime.UtcNow.AddHours(-1),
            CompletedAt = DateTime.UtcNow.AddHours(-1).AddMinutes(2),
            Error = "Failed to generate PDF report"
        }
    };

    [HttpPost]
    public ActionResult<ExportJob> CreateExportJob([FromBody] ExportRequest request)
    {
        var job = new ExportJob
        {
            Id = Guid.NewGuid(),
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        _exportJobs.Add(job);

        // In a real implementation, this would:
        // 1. Validate the request
        // 2. Queue the job for background processing
        // 3. Return the job ID for status tracking

        // Simulate immediate processing for demo
        Task.Run(async () =>
        {
            await Task.Delay(2000); // Simulate processing time
            var jobToUpdate = _exportJobs.FirstOrDefault(j => j.Id == job.Id);
            if (jobToUpdate != null)
            {
                jobToUpdate.Status = "processing";
                
                await Task.Delay(3000); // More processing
                
                jobToUpdate.Status = "completed";
                jobToUpdate.CompletedAt = DateTime.UtcNow;
                jobToUpdate.DownloadUrl = $"https://example.com/export/{job.Id}.{request.Format}";
            }
        });

        return CreatedAtAction(nameof(GetExportJob), new { jobId = job.Id }, job);
    }

    [HttpGet("{jobId}")]
    public ActionResult<ExportJob> GetExportJob(Guid jobId)
    {
        var job = _exportJobs.FirstOrDefault(j => j.Id == jobId);
        if (job == null)
        {
            return NotFound();
        }
        return Ok(job);
    }

    [HttpGet("jobs")]
    public ActionResult<List<ExportJob>> GetExportJobs()
    {
        var jobs = _exportJobs
            .OrderByDescending(j => j.CreatedAt)
            .Take(50) // Limit to recent jobs
            .ToList();
        
        return Ok(jobs);
    }

    [HttpDelete("{jobId}")]
    public ActionResult DeleteExportJob(Guid jobId)
    {
        var job = _exportJobs.FirstOrDefault(j => j.Id == jobId);
        if (job == null)
        {
            return NotFound();
        }

        _exportJobs.Remove(job);
        return NoContent();
    }
}
