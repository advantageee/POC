using Dapper;
using InvestorCodex.SyncService.Models;
using Npgsql;

namespace InvestorCodex.SyncService.Data;

public class ContactRepository
{
    private readonly string _connectionString;

    public ContactRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Postgres") ?? string.Empty;
    }

    public async Task UpsertAsync(IEnumerable<Contact> contacts, CancellationToken ct)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        foreach (var c in contacts)
        {
            const string sql = @"INSERT INTO contacts (name, title, email, linkedin)
VALUES (@Name, @Title, @Email, @LinkedInUrl)
ON CONFLICT (email) DO UPDATE SET title = EXCLUDED.title, linkedin = EXCLUDED.linkedin";
            await conn.ExecuteAsync(new CommandDefinition(sql, c, cancellationToken: ct));
        }
    }
}
