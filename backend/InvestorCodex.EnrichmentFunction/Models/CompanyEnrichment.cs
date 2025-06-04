namespace InvestorCodex.EnrichmentFunction.Models;

public class CompanyEnrichment
{
    public string? Summary { get; set; }
    public double InvestmentScore { get; set; }
    public List<string> Tags { get; set; } = new();
    public List<string> RiskFlags { get; set; } = new();
}
