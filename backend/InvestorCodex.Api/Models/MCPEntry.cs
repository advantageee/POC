namespace InvestorCodex.Api.Models;

public class MCPEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Headline { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public string Source { get; set; } = string.Empty;
    public List<string> Topics { get; set; } = new();
    public double Confidence { get; set; }
}
