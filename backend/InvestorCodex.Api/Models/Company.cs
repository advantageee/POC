namespace InvestorCodex.Api.Models;

public class Company
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Domain { get; set; }
    public string? Industry { get; set; }
    public string? Location { get; set; }
    public int? Headcount { get; set; }
    public string? FundingStage { get; set; }
    public string? Summary { get; set; }
    public float InvestmentScore { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string[] RiskFlags { get; set; } = Array.Empty<string>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

