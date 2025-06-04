namespace InvestorCodex.Api.Models;

public class Company
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Domain { get; set; }
    public string? Industry { get; set; }
    public int? Headcount { get; set; }
    public string? FundingStage { get; set; }
    public string? Summary { get; set; }
}

