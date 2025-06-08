namespace InvestorCodex.Api.Models;

public class Investment
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string? Round { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public DateTime FilingDate { get; set; }
    public string? Source { get; set; }
    public string? Url { get; set; }
    public string? Summary { get; set; }
    public float? InvestmentScore { get; set; }
    public string? FilingType { get; set; }
    public string? Company { get; set; } // For frontend compatibility
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
