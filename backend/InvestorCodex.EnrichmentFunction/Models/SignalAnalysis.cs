namespace InvestorCodex.EnrichmentFunction.Models;

public class SignalAnalysis
{
    public List<string> Tags { get; set; } = new();
    public string? Severity { get; set; }
    public string? Summary { get; set; }
}
