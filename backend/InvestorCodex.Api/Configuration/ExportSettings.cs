namespace InvestorCodex.Api.Configuration;

public class ExportSettings
{
    public const string SectionName = "Export";

    public string ServiceBusConnectionString { get; set; } = string.Empty;
    public string QueueName { get; set; } = "export-jobs";
    public string BlobConnectionString { get; set; } = string.Empty;
    public string ContainerName { get; set; } = "exports";
}
