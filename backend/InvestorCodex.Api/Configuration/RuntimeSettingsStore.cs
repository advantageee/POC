namespace InvestorCodex.Api.Configuration;

public static class RuntimeSettingsStore
{
    public static VectorDbSettings VectorDb { get; set; } = new();
    public static BlobStorageSettings BlobStorage { get; set; } = new();
}
