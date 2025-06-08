using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Data;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignalsController : ControllerBase
{
    private readonly ISignalRepository _signalRepository;

    public SignalsController(ISignalRepository signalRepository)
    {
        _signalRepository = signalRepository;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<Signal>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? types = null,
        [FromQuery] string[]? severities = null)
    {
        try
        {
            var (signals, totalCount) = await _signalRepository.GetSignalsAsync(page, pageSize, search, companyId, types, severities);
            
            var response = new PaginatedResponse<Signal>
            {
                Data = signals.ToList(),
                Total = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Signal>> GetById(Guid id)
    {
        try
        {
            var signal = await _signalRepository.GetSignalByIdAsync(id);
            if (signal == null)
            {
                return NotFound($"Signal with ID {id} not found.");
            }
            return Ok(signal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Signal>> Post([FromBody] Signal signal)
    {
        try
        {
            if (signal == null)
            {
                return BadRequest("Signal data is required.");
            }

            var createdSignal = await _signalRepository.CreateSignalAsync(signal);
            return CreatedAtAction(nameof(GetById), new { id = createdSignal.Id }, createdSignal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Signal>> Put(Guid id, [FromBody] Signal signal)
    {
        try
        {
            if (signal == null)
            {
                return BadRequest("Signal data is required.");
            }

            var updatedSignal = await _signalRepository.UpdateSignalAsync(id, signal);
            if (updatedSignal == null)
            {
                return NotFound($"Signal with ID {id} not found.");
            }
            return Ok(updatedSignal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _signalRepository.DeleteSignalAsync(id);
            if (!deleted)
            {
                return NotFound($"Signal with ID {id} not found.");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
