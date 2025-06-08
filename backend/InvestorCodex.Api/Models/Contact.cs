namespace InvestorCodex.Api.Models;

public class Contact
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string? Name { get; set; }
    public string? Title { get; set; }
    public string? Email { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Persona { get; set; }
    public string? Summary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
