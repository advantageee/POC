namespace InvestorCodex.Api.Models;

public class Signal
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string? Type { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string? Url { get; set; }
    public string Severity { get; set; } = "low"; // low, medium, high
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string? Summary { get; set; }
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    
    // For responses that include company info
    public Company? Company { get; set; }
}
