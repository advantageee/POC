using Microsoft.Azure.Cosmos;

namespace InvestorCodex.SyncService.Data;

public class SyncFailureLogger
{
    private readonly Container _container;

    public SyncFailureLogger(IConfiguration config)
    {
        var conn = config.GetConnectionString("Cosmos") ?? string.Empty;
        var client = new CosmosClient(conn);
        _container = client.GetContainer("investor-codex", "sync_failures");
    }

    public async Task LogFailureAsync(Exception ex, CancellationToken ct)
    {
        var doc = new { id = Guid.NewGuid().ToString(), message = ex.Message, stack = ex.StackTrace, timestamp = DateTime.UtcNow };
        await _container.CreateItemAsync(doc, cancellationToken: ct);
    }
}
