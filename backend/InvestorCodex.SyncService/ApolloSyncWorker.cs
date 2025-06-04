using InvestorCodex.SyncService.Data;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace InvestorCodex.SyncService;

/// <summary>
/// Worker service that fetches company and contact data from Apollo and stores
/// it in PostgreSQL. Failures are logged to CosmosDB. Runs once per day.
/// </summary>

public class ApolloSyncWorker : BackgroundService
{
    private readonly ApolloClient _client;
    private readonly CompanyRepository _companies;
    private readonly ContactRepository _contacts;
    private readonly SyncFailureLogger _failureLogger;
    private readonly ILogger<ApolloSyncWorker> _logger;

    public ApolloSyncWorker(
        ApolloClient client,
        CompanyRepository companies,
        ContactRepository contacts,
        SyncFailureLogger failureLogger,
        ILogger<ApolloSyncWorker> logger)
    {
        _client = client;
        _companies = companies;
        _contacts = contacts;
        _failureLogger = failureLogger;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var timer = new PeriodicTimer(TimeSpan.FromHours(24));
        do
        {
            try
            {
                var companies = await _client.FetchCompaniesAsync(stoppingToken);
                await _companies.UpsertAsync(companies, stoppingToken);

                var contacts = await _client.FetchContactsAsync(stoppingToken);
                await _contacts.UpsertAsync(contacts, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Apollo sync failed");
                await _failureLogger.LogFailureAsync(ex, stoppingToken);
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
