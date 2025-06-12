using InvestorCodex.Api.Configuration;

namespace InvestorCodex.Api.Models;

public class SettingsDto
{
    public string ApolloApiKey { get; set; } = string.Empty;
    public string ApolloBaseUrl { get; set; } = string.Empty;
    public string TwitterApiKey { get; set; } = string.Empty;
    public string TwitterApiSecret { get; set; } = string.Empty;
    public string TwitterBearerToken { get; set; } = string.Empty;
    public string OpenAIEndpoint { get; set; } = string.Empty;
    public string OpenAIApiKey { get; set; } = string.Empty;
    public string OpenAIModel { get; set; } = string.Empty;
    public string DbConnectionString { get; set; } = string.Empty;
}
