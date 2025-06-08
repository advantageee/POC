using InvestorCodex.Api.Data;
using InvestorCodex.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvestmentsController : ControllerBase
{
    private readonly IInvestmentRepository _investmentRepository;

    public InvestmentsController(IInvestmentRepository investmentRepository)
    {
        _investmentRepository = investmentRepository;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<Investment>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? rounds = null,
        [FromQuery] decimal? minAmount = null,
        [FromQuery] decimal? maxAmount = null)
    {
        try
        {
            var result = await _investmentRepository.GetInvestmentsAsync(
                page, pageSize, search, companyId, rounds, minAmount, maxAmount);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching investments: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Investment>> GetById(Guid id)
    {
        try
        {
            var investment = await _investmentRepository.GetInvestmentByIdAsync(id);
            if (investment == null)
            {
                return NotFound($"Investment with ID {id} not found");
            }
            return Ok(investment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching investment: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Investment>> Post([FromBody] Investment investment)
    {
        try
        {
            var createdInvestment = await _investmentRepository.CreateInvestmentAsync(investment);
            return CreatedAtAction(nameof(GetById), new { id = createdInvestment.Id }, createdInvestment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating investment: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Investment>> Put(Guid id, [FromBody] Investment investment)
    {
        try
        {
            var updatedInvestment = await _investmentRepository.UpdateInvestmentAsync(id, investment);
            if (updatedInvestment == null)
            {
                return NotFound($"Investment with ID {id} not found");
            }
            return Ok(updatedInvestment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating investment: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _investmentRepository.DeleteInvestmentAsync(id);
            if (!deleted)
            {
                return NotFound($"Investment with ID {id} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting investment: {ex.Message}");
        }
    }
}
