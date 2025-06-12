namespace InvestorCodex.Api.Configuration;

public class VectorDbSettings
{
    public const string SectionName = "VectorDb";

    public string Endpoint { get; set; } = string.Empty;
    public string Index { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
}
