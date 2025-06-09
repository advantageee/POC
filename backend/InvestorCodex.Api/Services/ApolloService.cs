using System.Net.Http.Headers;
using System.Text.Json;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Configuration;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface IApolloService
{
    Task<PaginatedResponse<Company>> GetCompaniesAsync(int page, int pageSize, string? search = null);
    Task<PaginatedResponse<Contact>> GetContactsAsync(int page, int pageSize, string? search = null);
}

public class ApolloService : IApolloService
{
    private readonly HttpClient _httpClient;
    private readonly ApolloSettings _settings;
    private readonly ILogger<ApolloService> _logger;

    public ApolloService(HttpClient httpClient, IOptions<ApolloSettings> settings, ILogger<ApolloService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
        _httpClient.DefaultRequestHeaders.Add("X-Api-Key", _settings.ApiKey);
    }

    public async Task<PaginatedResponse<Company>> GetCompaniesAsync(int page, int pageSize, string? search = null)
    {
        try
        {
            var requestBody = new
            {
                page = page,
                per_page = pageSize,
                person_titles = new[] { "founder", "ceo", "cto", "president" },
                q_keywords = search ?? "startup technology"
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.apollo.io/v1/mixed_companies/search", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var apolloResponse = JsonSerializer.Deserialize<ApolloCompanyResponse>(responseJson, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                });

                var companies = apolloResponse?.Companies?.Select(MapToCompany).ToList() ?? new List<Company>();
                
                return new PaginatedResponse<Company>
                {
                    Data = companies,
                    Page = page,
                    PageSize = pageSize,
                    Total = apolloResponse?.TotalEntries ?? 0,
                    TotalPages = (int)Math.Ceiling((apolloResponse?.TotalEntries ?? 0) / (double)pageSize)
                };
            }
            else
            {
                _logger.LogError("Apollo API error: {StatusCode} - {Content}", response.StatusCode, await response.Content.ReadAsStringAsync());
                return GetFallbackCompanies(page, pageSize);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching companies from Apollo API");
            return GetFallbackCompanies(page, pageSize);
        }
    }

    public async Task<PaginatedResponse<Contact>> GetContactsAsync(int page, int pageSize, string? search = null)
    {
        try
        {
            var requestBody = new
            {
                page = page,
                per_page = pageSize,
                person_titles = new[] { "founder", "ceo", "cto", "vp", "director" },
                q_keywords = search ?? "technology startup"
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.apollo.io/v1/people/search", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var apolloResponse = JsonSerializer.Deserialize<ApolloContactResponse>(responseJson, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                });

                var contacts = apolloResponse?.People?.Select(MapToContact).ToList() ?? new List<Contact>();
                
                return new PaginatedResponse<Contact>
                {
                    Data = contacts,
                    Page = page,
                    PageSize = pageSize,
                    Total = apolloResponse?.TotalEntries ?? 0,
                    TotalPages = (int)Math.Ceiling((apolloResponse?.TotalEntries ?? 0) / (double)pageSize)
                };
            }
            else
            {
                _logger.LogError("Apollo API error: {StatusCode} - {Content}", response.StatusCode, await response.Content.ReadAsStringAsync());
                return GetFallbackContacts(page, pageSize);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching contacts from Apollo API");
            return GetFallbackContacts(page, pageSize);
        }
    }

    private Company MapToCompany(ApolloCompany apolloCompany)
    {
        return new Company
        {
            Id = Guid.NewGuid(),
            Name = apolloCompany.Name ?? "Unknown Company",
            Domain = apolloCompany.WebsiteUrl,
            Industry = apolloCompany.Industry,
            Location = $"{apolloCompany.City}, {apolloCompany.State} {apolloCompany.Country}".Trim(),
            Headcount = apolloCompany.EstimatedNumEmployees,
            FundingStage = "Unknown",
            Summary = apolloCompany.ShortDescription ?? "No description available",
            InvestmentScore = 0.0f,
            Tags = apolloCompany.Keywords?.ToArray() ?? Array.Empty<string>(),
            RiskFlags = Array.Empty<string>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private Contact MapToContact(ApolloPerson person)
    {        return new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(), // Would need to link to actual company
            Name = $"{person.FirstName} {person.LastName}".Trim(),
            Title = person.Title,
            Email = person.Email,
            LinkedInUrl = person.LinkedinUrl,
            Persona = DeterminePersona(person.Title ?? ""),
            Summary = $"{person.Title} at {person.Organization?.Name}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private string DeterminePersona(string title)
    {
        var lowerTitle = title.ToLower();
        if (lowerTitle.Contains("ceo") || lowerTitle.Contains("founder") || lowerTitle.Contains("president"))
            return "Decision Maker";
        if (lowerTitle.Contains("cto") || lowerTitle.Contains("vp") || lowerTitle.Contains("director"))
            return "Technical Leader";
        return "Professional";
    }

    private PaginatedResponse<Company> GetFallbackCompanies(int page, int pageSize)
    {
        var companies = new List<Company>
        {
            new Company
            {
                Id = Guid.NewGuid(),
                Name = "Apollo Test Company",
                Domain = "apollotest.com",
                Industry = "Technology",
                Location = "San Francisco, CA",
                Headcount = 50,
                FundingStage = "Series A",
                Summary = "Test company from Apollo API fallback",
                InvestmentScore = 7.5f,
                Tags = new[] { "SaaS", "B2B" },
                RiskFlags = Array.Empty<string>(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        return new PaginatedResponse<Company>
        {
            Data = companies,
            Page = page,
            PageSize = pageSize,
            Total = 1,
            TotalPages = 1
        };
    }

    private PaginatedResponse<Contact> GetFallbackContacts(int page, int pageSize)
    {
        var contacts = new List<Contact>
        {            new Contact
            {
                Id = Guid.NewGuid(),
                CompanyId = Guid.NewGuid(),
                Name = "John Apollo",
                Title = "CEO",
                Email = "john@apollotest.com",
                LinkedInUrl = "https://linkedin.com/in/johnapollo",
                Persona = "Decision Maker",
                Summary = "CEO at Apollo Test Company",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        return new PaginatedResponse<Contact>
        {
            Data = contacts,
            Page = page,
            PageSize = pageSize,
            Total = 1,
            TotalPages = 1
        };
    }
}

// Apollo API response models
public class ApolloCompanyResponse
{
    public List<ApolloCompany>? Companies { get; set; }
    public int TotalEntries { get; set; }
}

public class ApolloContactResponse
{
    public List<ApolloPerson>? People { get; set; }
    public int TotalEntries { get; set; }
}

public class ApolloCompany
{
    public string? Name { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public int? EstimatedNumEmployees { get; set; }
    public string? ShortDescription { get; set; }
    public List<string>? Keywords { get; set; }
}

public class ApolloPerson
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Title { get; set; }
    public string? Email { get; set; }
    public string? LinkedinUrl { get; set; }
    public ApolloOrganization? Organization { get; set; }
}

public class ApolloOrganization
{
    public string? Name { get; set; }
}
