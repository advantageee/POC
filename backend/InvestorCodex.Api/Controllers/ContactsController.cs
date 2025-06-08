using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    // Mock data for development - will be replaced with database
    private readonly List<Contact> _contacts = new()
    {
        new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Sarah Chen",
            Title = "Chief Technology Officer",
            Email = "s.chen@techcorp.com",
            LinkedInUrl = "https://linkedin.com/in/sarahchen",
            Persona = "Technical Leader",
            Summary = "Experienced CTO with expertise in AI and machine learning systems.",
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        },
        new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Michael Rodriguez",
            Title = "VP of Engineering",
            Email = "m.rodriguez@techcorp.com",
            LinkedInUrl = "https://linkedin.com/in/michaelrodriguez",
            Persona = "Engineering Leader",
            Summary = "Veteran engineering leader with background in scaling enterprise software.",
            CreatedAt = DateTime.UtcNow.AddDays(-25),
            UpdatedAt = DateTime.UtcNow.AddDays(-3)
        },
        new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Emily Johnson",
            Title = "CEO & Founder",
            Email = "emily@greentech.com",
            LinkedInUrl = "https://linkedin.com/in/emilyjohnson",
            Persona = "Founder",
            Summary = "Serial entrepreneur focused on sustainable technology solutions.",
            CreatedAt = DateTime.UtcNow.AddDays(-20),
            UpdatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Dr. James Wilson",
            Title = "Chief Scientific Officer",
            Email = "j.wilson@biomed.com",
            LinkedInUrl = "https://linkedin.com/in/jameswilson",
            Persona = "Scientific Leader",
            Summary = "Renowned researcher in biotechnology with 15+ years experience.",
            CreatedAt = DateTime.UtcNow.AddDays(-15),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        }
    };

    [HttpGet]
    public ActionResult<PaginatedResponse<Contact>> GetContacts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? companyId = null,
        [FromQuery] string[]? persona = null)
    {
        var query = _contacts.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => 
                (c.Name != null && c.Name.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (c.Title != null && c.Title.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (c.Email != null && c.Email.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (companyId.HasValue)
        {
            query = query.Where(c => c.CompanyId == companyId.Value);
        }

        if (persona != null && persona.Length > 0)
        {
            query = query.Where(c => c.Persona != null && persona.Contains(c.Persona));
        }

        var total = query.Count();
        var totalPages = (int)Math.Ceiling((double)total / pageSize);
        var contacts = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(c => c.Name)
            .ToList();

        return Ok(new PaginatedResponse<Contact>
        {
            Data = contacts,
            Page = page,
            PageSize = pageSize,
            Total = total,
            TotalPages = totalPages
        });
    }

    [HttpGet("{id}")]
    public ActionResult<Contact> GetContact(Guid id)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == id);
        if (contact == null)
        {
            return NotFound();
        }
        return Ok(contact);
    }

    [HttpPost]
    public ActionResult<Contact> CreateContact([FromBody] Contact contact)
    {
        contact.Id = Guid.NewGuid();
        contact.CreatedAt = DateTime.UtcNow;
        contact.UpdatedAt = DateTime.UtcNow;
        _contacts.Add(contact);
        return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, contact);
    }

    [HttpPut("{id}")]
    public ActionResult<Contact> UpdateContact(Guid id, [FromBody] Contact contact)
    {
        var existingContact = _contacts.FirstOrDefault(c => c.Id == id);
        if (existingContact == null)
        {
            return NotFound();
        }

        existingContact.Name = contact.Name;
        existingContact.Title = contact.Title;
        existingContact.Email = contact.Email;
        existingContact.LinkedInUrl = contact.LinkedInUrl;
        existingContact.Persona = contact.Persona;
        existingContact.Summary = contact.Summary;
        existingContact.UpdatedAt = DateTime.UtcNow;

        return Ok(existingContact);
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteContact(Guid id)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == id);
        if (contact == null)
        {
            return NotFound();
        }

        _contacts.Remove(contact);
        return NoContent();
    }
}
