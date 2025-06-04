using System.Net.Http.Headers;
using System.Text.Json;
using InvestorCodex.SyncService.Models;

namespace InvestorCodex.SyncService.Data;

public class ApolloClient
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public ApolloClient(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["APOLLO_API_KEY"] ?? string.Empty;
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<IEnumerable<Company>> FetchCompaniesAsync(CancellationToken ct)
    {
        var resp = await _http.GetAsync("https://api.apollo.io/v1/companies/search", ct);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync(ct);
        // TODO: parse according to real schema
        return JsonSerializer.Deserialize<List<Company>>(json) ?? [];
    }

    public async Task<IEnumerable<Contact>> FetchContactsAsync(CancellationToken ct)
    {
        var resp = await _http.GetAsync("https://api.apollo.io/v1/people/search", ct);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<List<Contact>>(json) ?? [];
    }
}
