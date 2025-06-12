namespace InvestorCodex.Api.Configuration;

public class BlobStorageSettings
{
    public const string SectionName = "BlobStorage";

    public string ConnectionString { get; set; } = string.Empty;
    public string Container { get; set; } = string.Empty;
}
