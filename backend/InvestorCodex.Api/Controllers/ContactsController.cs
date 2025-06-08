using InvestorCodex.Api.Data;
using InvestorCodex.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly IContactRepository _contactRepository;

    public ContactsController(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<Contact>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? personas = null)
    {
        try
        {
            var result = await _contactRepository.GetContactsAsync(
                page, pageSize, search, companyId, personas);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching contacts: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Contact>> GetById(Guid id)
    {
        try
        {
            var contact = await _contactRepository.GetContactByIdAsync(id);
            if (contact == null)
            {
                return NotFound($"Contact with ID {id} not found");
            }
            return Ok(contact);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching contact: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Contact>> Post([FromBody] Contact contact)
    {
        try
        {
            var createdContact = await _contactRepository.CreateContactAsync(contact);
            return CreatedAtAction(nameof(GetById), new { id = createdContact.Id }, createdContact);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating contact: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Contact>> Put(Guid id, [FromBody] Contact contact)
    {
        try
        {
            var updatedContact = await _contactRepository.UpdateContactAsync(id, contact);
            if (updatedContact == null)
            {
                return NotFound($"Contact with ID {id} not found");
            }
            return Ok(updatedContact);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating contact: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _contactRepository.DeleteContactAsync(id);
            if (!deleted)
            {
                return NotFound($"Contact with ID {id} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting contact: {ex.Message}");
        }
    }
}
