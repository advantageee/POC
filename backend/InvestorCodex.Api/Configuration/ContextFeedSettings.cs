namespace InvestorCodex.Api.Configuration;

public class ContextFeedSettings
{
    public const string SectionName = "ContextFeeds";

    public Dictionary<string, string> Feeds { get; set; } = new();
}
