using Dapper;
using InvestorCodex.SyncService.Models;
using Npgsql;

namespace InvestorCodex.SyncService.Data;

public class CompanyRepository
{
    private readonly string _connectionString;

    public CompanyRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Postgres") ?? string.Empty;
    }

    public async Task UpsertAsync(IEnumerable<Company> companies, CancellationToken ct)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        foreach (var c in companies)
        {
            const string sql = @"INSERT INTO companies (name, domain, industry, headcount, funding_stage)
VALUES (@Name, @Domain, @Industry, @Headcount, @FundingStage)
ON CONFLICT (domain) DO UPDATE SET industry = EXCLUDED.industry, headcount = EXCLUDED.headcount, funding_stage = EXCLUDED.funding_stage";
            await conn.ExecuteAsync(new CommandDefinition(sql, c, cancellationToken: ct));
        }
    }
}
