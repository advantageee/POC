namespace InvestorCodex.Api.Configuration
{
    public class AdvantageAISettings
    {
        public const string SectionName = "AdvantageAI";
        
        public string Url { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
    }
    
    public class ApolloSettings
    {
        public const string SectionName = "Apollo";
        
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = string.Empty;
    }
    
    public class TwitterAPISettings
    {
        public const string SectionName = "TwitterAPI";

        public string ApiKey { get; set; } = string.Empty;
        public string ApiSecret { get; set; } = string.Empty;
        public string BearerToken { get; set; } = string.Empty;
    }

    public class VectorDbSettings
    {
        public const string SectionName = "VectorDb";

        public string Endpoint { get; set; } = string.Empty;
        public string Index { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
    }

    public class BlobStorageSettings
    {
        public const string SectionName = "BlobStorage";

        public string ConnectionString { get; set; } = string.Empty;
        public string Container { get; set; } = string.Empty;
    }
}
