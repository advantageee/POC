using System.Net.Http.Headers;
using System.Text.Json;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Data;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface IApolloService
{
    Task<PaginatedResponse<Company>> GetCompaniesAsync(int page, int pageSize, string? search = null);
    Task<PaginatedResponse<Contact>> GetContactsAsync(int page, int pageSize, string? search = null);
    Task<int> LoadAllCompaniesFromApolloAsync(CancellationToken cancellationToken = default);
    Task<int> LoadAllContactsFromApolloAsync(CancellationToken cancellationToken = default);
    Task<bool> SyncCompaniesWithDatabaseAsync(int maxPages = 10, CancellationToken cancellationToken = default);
}

public class ApolloService : IApolloService
{
    private readonly HttpClient _httpClient;
    private readonly ApolloSettings _settings;
    private readonly ILogger<ApolloService> _logger;
    private readonly ICompanyRepository _companyRepository;
    private readonly IContactRepository _contactRepository;

    private readonly string[] _investorSearchTerms = {
        "venture capital",
        "private equity", 
        "investment fund",
        "angel investor",
        "startup accelerator",
        "investment management",
        "hedge fund",
        "asset management",
        "growth equity",
        "seed fund"
    };

    public ApolloService(
        HttpClient httpClient, 
        IOptions<ApolloSettings> settings, 
        ILogger<ApolloService> logger,
        ICompanyRepository companyRepository,
        IContactRepository contactRepository)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        _companyRepository = companyRepository;
        _contactRepository = contactRepository;
        
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
        _httpClient.DefaultRequestHeaders.Add("X-Api-Key", _settings.ApiKey);
    }    public async Task<PaginatedResponse<Company>> GetCompaniesAsync(int page, int pageSize, string? search = null)
    {        try
        {
            // First check if we have companies in the database
            var dbResult = await _companyRepository.GetCompaniesAsync(page, pageSize, search);
            
            // If we have enough data in database, return it
            if (dbResult.Data.Count >= pageSize || dbResult.Total > pageSize)
            {
                _logger.LogInformation("Returning {Count} companies from database", dbResult.Data.Count);
                return dbResult;
            }
            
            // If database is sparse, try to get from Apollo and supplement
            _logger.LogInformation("Database has limited data, querying Apollo API for search: {Search}", search ?? "default");
            
            // Try the user's search query first, then fallback to investor terms if no results
            var searchTerms = new List<string>();
            if (!string.IsNullOrEmpty(search))
            {
                searchTerms.Add(search);
                // Only add investor terms as fallback if the search doesn't match common company patterns
                if (!IsLikelyCompanyName(search))
                {
                    searchTerms.AddRange(_investorSearchTerms.Take(2)); // Add top 2 investor terms
                }
            }
            else
            {
                searchTerms.AddRange(_investorSearchTerms.Take(2)); // Default to investor terms
            }
            
            var bestResult = new PaginatedResponse<Company>
            {
                Data = new List<Company>(),
                Page = page,
                PageSize = pageSize,
                Total = 0,
                TotalPages = 0
            };
            
            foreach (var searchTerm in searchTerms)
            {
                var apolloResult = await GetCompaniesFromApolloAsync(page, pageSize, searchTerm);
                
                if (apolloResult.Data?.Any() == true)
                {
                    bestResult = apolloResult;
                    _logger.LogInformation("Apollo returned {Count} companies for term: {SearchTerm}", apolloResult.Data.Count, searchTerm);
                    
                    // Save new companies to database for future queries
                    _ = Task.Run(async () =>
                    {
                        foreach (var company in apolloResult.Data)
                        {
                            if (await IsCompanyNewAsync(company))
                            {
                                try
                                {
                                    await _companyRepository.CreateCompanyAsync(company);
                                    _logger.LogDebug("Cached company from Apollo: {CompanyName}", company.Name);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(ex, "Failed to cache company: {CompanyName}", company.Name);
                                }
                            }
                        }
                    });
                    
                    break; // Use first successful result
                }
            }
            
            // If Apollo returned data, return it; otherwise combine with database results
            if (bestResult.Data.Any())
            {
                return bestResult;
            }
            else
            {
                _logger.LogInformation("Apollo API returned no data, returning database results: {Count} companies", dbResult.Data.Count);
                return dbResult.Data.Any() ? dbResult : GetFallbackCompanies(page, pageSize);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetCompaniesAsync, falling back to database");
            
            // Fallback to database
            try
            {
                var dbResult = await _companyRepository.GetCompaniesAsync(page, pageSize, search);
                return dbResult.Data.Any() ? dbResult : GetFallbackCompanies(page, pageSize);
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Database fallback also failed");
                return GetFallbackCompanies(page, pageSize);
            }
        }
    }    public async Task<PaginatedResponse<Contact>> GetContactsAsync(int page, int pageSize, string? search = null)
    {
        try
        {
            // First check if we have contacts in the database
            var dbResult = await _contactRepository.GetContactsAsync(page, pageSize, search);
            
            // If we have enough data in database, return it
            if (dbResult.Data.Count >= pageSize || dbResult.Total > pageSize)
            {
                _logger.LogInformation("Returning {Count} contacts from database", dbResult.Data.Count);
                return dbResult;
            }
            
            // If database is sparse, try to get from Apollo and supplement
            _logger.LogInformation("Database has limited contacts, querying Apollo API for search: {Search}", search ?? "default");
            
            var apolloResult = await GetContactsFromApolloAsync(page, pageSize, search ?? "investment");
            
            if (apolloResult.Data?.Any() == true)
            {
                _logger.LogInformation("Apollo returned {Count} contacts", apolloResult.Data.Count);
                
                // Save new contacts to database for future queries
                _ = Task.Run(async () =>
                {
                    foreach (var contact in apolloResult.Data)
                    {
                        if (await IsContactNewAsync(contact))
                        {
                            try
                            {
                                await _contactRepository.CreateContactAsync(contact);
                                _logger.LogDebug("Cached contact from Apollo: {ContactName}", contact.Name);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to cache contact: {ContactName}", contact.Name);
                            }
                        }
                    }
                });
                
                return apolloResult;
            }
            else
            {
                _logger.LogInformation("Apollo API returned no contacts, returning database results: {Count} contacts", dbResult.Data.Count);
                return dbResult.Data.Any() ? dbResult : GetFallbackContacts(page, pageSize);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetContactsAsync, falling back to database");
            
            try
            {
                var dbResult = await _contactRepository.GetContactsAsync(page, pageSize, search);
                return dbResult.Data.Any() ? dbResult : GetFallbackContacts(page, pageSize);
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Database fallback also failed");
                return GetFallbackContacts(page, pageSize);
            }
        }
    }

    public async Task<int> LoadAllCompaniesFromApolloAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting to load all companies from Apollo API");
        var totalLoaded = 0;
        var page = 1;
        const int pageSize = 100; // Use maximum page size for efficiency
        
        foreach (var searchTerm in _investorSearchTerms)
        {
            if (cancellationToken.IsCancellationRequested) break;
            
            _logger.LogInformation("Loading companies for search term: {SearchTerm}", searchTerm);
            page = 1;
            
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var result = await GetCompaniesFromApolloAsync(page, pageSize, searchTerm);
                    
                    if (result.Data == null || !result.Data.Any())
                    {
                        _logger.LogInformation("No more companies found for search term: {SearchTerm}, page: {Page}", searchTerm, page);
                        break;
                    }
                    
                    // Filter out companies that already exist in database
                    var newCompanies = new List<Company>();
                    foreach (var company in result.Data)
                    {
                        if (!string.IsNullOrEmpty(company.Domain))
                        {
                            var existingCompanies = await _companyRepository.GetCompaniesAsync(1, 1, company.Domain);
                            if (!existingCompanies.Data.Any(c => c.Domain?.Equals(company.Domain, StringComparison.OrdinalIgnoreCase) == true))
                            {
                                newCompanies.Add(company);
                            }
                        }
                        else if (!string.IsNullOrEmpty(company.Name))
                        {
                            var existingCompanies = await _companyRepository.GetCompaniesAsync(1, 1, company.Name);
                            if (!existingCompanies.Data.Any(c => c.Name?.Equals(company.Name, StringComparison.OrdinalIgnoreCase) == true))
                            {
                                newCompanies.Add(company);
                            }
                        }
                    }
                    
                    // Save new companies to database
                    foreach (var company in newCompanies)
                    {
                        try
                        {
                            await _companyRepository.CreateCompanyAsync(company);
                            totalLoaded++;
                            _logger.LogDebug("Saved company: {CompanyName}", company.Name);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to save company: {CompanyName}", company.Name);
                        }
                    }
                    
                    _logger.LogInformation("Loaded {Count} new companies from page {Page} for term {SearchTerm}", newCompanies.Count, page, searchTerm);
                    
                    // Check if we've reached the end
                    if (result.Data.Count < pageSize || page >= result.TotalPages)
                    {
                        break;
                    }
                    
                    page++;
                    
                    // Add delay to respect rate limits
                    await Task.Delay(100, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error loading companies from Apollo for term {SearchTerm}, page {Page}", searchTerm, page);
                    break;
                }
            }
        }
        
        _logger.LogInformation("Completed loading companies from Apollo API. Total loaded: {TotalLoaded}", totalLoaded);
        return totalLoaded;
    }

    public async Task<int> LoadAllContactsFromApolloAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting to load all contacts from Apollo API");
        var totalLoaded = 0;
        var page = 1;
        const int pageSize = 100;
        
        foreach (var searchTerm in _investorSearchTerms)
        {
            if (cancellationToken.IsCancellationRequested) break;
            
            _logger.LogInformation("Loading contacts for search term: {SearchTerm}", searchTerm);
            page = 1;
            
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var result = await GetContactsFromApolloAsync(page, pageSize, searchTerm);
                    
                    if (result.Data == null || !result.Data.Any())
                    {
                        _logger.LogInformation("No more contacts found for search term: {SearchTerm}, page: {Page}", searchTerm, page);
                        break;
                    }
                    
                    // Filter out contacts that already exist and find their company IDs
                    var newContacts = new List<Contact>();
                    foreach (var contact in result.Data)
                    {
                        if (!string.IsNullOrEmpty(contact.Email))
                        {
                            var existingContacts = await _contactRepository.GetContactsAsync(1, 1, contact.Email);
                            if (!existingContacts.Data.Any(c => c.Email?.Equals(contact.Email, StringComparison.OrdinalIgnoreCase) == true))
                            {
                                // Try to find the company for this contact
                                if (!string.IsNullOrEmpty(contact.Summary))
                                {
                                    var companyName = ExtractCompanyNameFromSummary(contact.Summary);
                                    if (!string.IsNullOrEmpty(companyName))
                                    {
                                        var companies = await _companyRepository.GetCompaniesAsync(1, 1, companyName);
                                        if (companies.Data.Any())
                                        {
                                            contact.CompanyId = companies.Data.First().Id;
                                        }
                                    }
                                }
                                newContacts.Add(contact);
                            }
                        }
                    }
                    
                    // Save new contacts to database
                    foreach (var contact in newContacts)
                    {
                        try
                        {
                            await _contactRepository.CreateContactAsync(contact);
                            totalLoaded++;
                            _logger.LogDebug("Saved contact: {ContactName}", contact.Name);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to save contact: {ContactName}", contact.Name);
                        }
                    }
                    
                    _logger.LogInformation("Loaded {Count} new contacts from page {Page} for term {SearchTerm}", newContacts.Count, page, searchTerm);
                    
                    // Check if we've reached the end
                    if (result.Data.Count < pageSize || page >= result.TotalPages)
                    {
                        break;
                    }
                    
                    page++;
                    
                    // Add delay to respect rate limits
                    await Task.Delay(100, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error loading contacts from Apollo for term {SearchTerm}, page {Page}", searchTerm, page);
                    break;
                }
            }
        }
        
        _logger.LogInformation("Completed loading contacts from Apollo API. Total loaded: {TotalLoaded}", totalLoaded);
        return totalLoaded;
    }

    public async Task<bool> SyncCompaniesWithDatabaseAsync(int maxPages = 10, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting smart sync with Apollo API - targeting investor companies");
        
        try
        {
            var totalCompaniesAdded = 0;
            var totalContactsAdded = 0;
            
            foreach (var searchTerm in _investorSearchTerms.Take(3)) // Limit to first 3 terms for initial sync
            {
                if (cancellationToken.IsCancellationRequested) break;
                
                _logger.LogInformation("Syncing companies for investment-focused search: {SearchTerm}", searchTerm);
                
                for (int page = 1; page <= maxPages; page++)
                {
                    if (cancellationToken.IsCancellationRequested) break;
                    
                    // Get companies that might be investors
                    var companiesResult = await GetCompaniesFromApolloAsync(page, 50, searchTerm);
                    
                    if (companiesResult.Data?.Any() == true)
                    {
                        var validInvestorCompanies = companiesResult.Data
                            .Where(c => IsLikelyInvestorCompany(c))
                            .ToList();
                            
                        foreach (var company in validInvestorCompanies)
                        {
                            if (await IsCompanyNewAsync(company))
                            {
                                try
                                {
                                    await _companyRepository.CreateCompanyAsync(company);
                                    totalCompaniesAdded++;
                                    _logger.LogInformation("Added investor company: {CompanyName}", company.Name);
                                    
                                    // Also try to get contacts for this company
                                    var contactsResult = await GetContactsFromApolloAsync(1, 25, company.Name ?? "");
                                    if (contactsResult.Data?.Any() == true)
                                    {
                                        foreach (var contact in contactsResult.Data.Take(5)) // Limit to top 5 contacts per company
                                        {
                                            if (await IsContactNewAsync(contact))
                                            {
                                                contact.CompanyId = company.Id;
                                                await _contactRepository.CreateContactAsync(contact);
                                                totalContactsAdded++;
                                            }
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(ex, "Failed to save company {CompanyName}", company.Name);
                                }
                            }
                        }
                        
                        if (validInvestorCompanies.Count == 0)
                        {
                            _logger.LogInformation("No investor companies found on page {Page} for {SearchTerm}", page, searchTerm);
                            break; // Move to next search term
                        }
                    }
                    else
                    {
                        _logger.LogInformation("No companies returned from Apollo for {SearchTerm}, page {Page}", searchTerm, page);
                        break;
                    }
                    
                    // Rate limiting
                    await Task.Delay(200, cancellationToken);
                }
            }
            
            _logger.LogInformation("Smart sync completed. Added {CompaniesCount} companies and {ContactsCount} contacts", 
                totalCompaniesAdded, totalContactsAdded);
                
            return totalCompaniesAdded > 0 || totalContactsAdded > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during smart sync with Apollo API");
            return false;
        }
    }

    private async Task<bool> IsCompanyNewAsync(Company company)
    {
        if (!string.IsNullOrEmpty(company.Domain))
        {
            var existing = await _companyRepository.GetCompaniesAsync(1, 1, company.Domain);
            return !existing.Data.Any(c => c.Domain?.Equals(company.Domain, StringComparison.OrdinalIgnoreCase) == true);
        }
        
        if (!string.IsNullOrEmpty(company.Name))
        {
            var existing = await _companyRepository.GetCompaniesAsync(1, 1, company.Name);
            return !existing.Data.Any(c => c.Name?.Equals(company.Name, StringComparison.OrdinalIgnoreCase) == true);
        }
        
        return true;
    }

    private async Task<bool> IsContactNewAsync(Contact contact)
    {
        if (!string.IsNullOrEmpty(contact.Email))
        {
            var existing = await _contactRepository.GetContactsAsync(1, 1, contact.Email);
            return !existing.Data.Any(c => c.Email?.Equals(contact.Email, StringComparison.OrdinalIgnoreCase) == true);
        }
        
        return true;
    }

    private static bool IsLikelyInvestorCompany(Company company)
    {
        var indicators = new[]
        {
            "venture", "capital", "fund", "investment", "equity", "partners",
            "management", "asset", "private", "hedge", "growth", "seed",
            "angel", "accelerator", "incubator"
        };
        
        var companyText = $"{company.Name} {company.Industry} {company.Summary}".ToLower();
        return indicators.Any(indicator => companyText.Contains(indicator));
    }

    private static string? ExtractCompanyNameFromSummary(string summary)
    {
        // Simple extraction logic - look for "at [Company Name]"
        var atIndex = summary.LastIndexOf(" at ", StringComparison.OrdinalIgnoreCase);
        if (atIndex >= 0 && atIndex + 4 < summary.Length)
        {
            var companyPart = summary.Substring(atIndex + 4);
            var spaceIndex = companyPart.IndexOf(' ');
            return spaceIndex > 0 ? companyPart.Substring(0, spaceIndex) : companyPart;
        }
        return null;
    }    private async Task<PaginatedResponse<Company>> GetCompaniesFromApolloAsync(int page, int pageSize, string? search = null)
    {
        try
        {
            // If search is provided, use it directly as company name/keywords
            // Otherwise fall back to investor-focused search
            var requestBody = !string.IsNullOrEmpty(search) && !_investorSearchTerms.Contains(search) 
                ? new
                {
                    page = page,
                    per_page = pageSize,
                    q_organization_name = search, // Search by company name
                    q_keywords = search // Also search in keywords
                }
                : new
                {
                    page = page,
                    per_page = pageSize,
                    person_titles = new[] { "founder", "ceo", "managing partner", "investment partner", "principal" },
                    q_keywords = search ?? "venture capital"
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
                return new PaginatedResponse<Company>
                {
                    Data = new List<Company>(),
                    Page = page,
                    PageSize = pageSize,
                    Total = 0,
                    TotalPages = 0
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching companies from Apollo API");
            return new PaginatedResponse<Company>
            {
                Data = new List<Company>(),
                Page = page,
                PageSize = pageSize,
                Total = 0,
                TotalPages = 0
            };
        }
    }

    private async Task<PaginatedResponse<Contact>> GetContactsFromApolloAsync(int page, int pageSize, string? search = null)
    {
        try
        {
            var requestBody = new
            {
                page = page,
                per_page = pageSize,
                person_titles = new[] { "partner", "managing director", "principal", "associate", "investment manager" },
                q_keywords = search ?? "investment"
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
                return new PaginatedResponse<Contact>
                {
                    Data = new List<Contact>(),
                    Page = page,
                    PageSize = pageSize,
                    Total = 0,
                    TotalPages = 0
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching contacts from Apollo API");
            return new PaginatedResponse<Contact>
            {
                Data = new List<Contact>(),
                Page = page,
                PageSize = pageSize,
                Total = 0,
                TotalPages = 0
            };
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
    }    private Contact MapToContact(ApolloPerson person)
    {        
        return new Contact
        {
            Id = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(), // Will be updated later if company is found
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
