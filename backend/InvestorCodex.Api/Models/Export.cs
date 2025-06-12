namespace InvestorCodex.Api.Models;

public class ExportRequest
{
    public string Format { get; set; } = "csv"; // csv, pdf
    public string Type { get; set; } = "companies"; // companies, signals
    public object? Filters { get; set; }
    public string[]? Fields { get; set; }
}

public class ExportJob
{
    public string Type { get; set; } = "companies";
    public string Format { get; set; } = "csv";
    public Guid Id { get; set; }
    public string Status { get; set; } = "pending"; // pending, processing, completed, failed
    public string? DownloadUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? Error { get; set; }
}
