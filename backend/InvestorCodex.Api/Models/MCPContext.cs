namespace InvestorCodex.Api.Models;

public class MCPContext
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public List<MCPEntry> Entries { get; set; } = new();
}
