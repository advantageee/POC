using Dapper;
using Npgsql;
using InvestorCodex.Api.Models;
using System.Data;

namespace InvestorCodex.Api.Data;

public class SignalRepository : ISignalRepository
{
    private readonly string _connectionString;

    public SignalRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=investorcodex;Username=postgres;Password=password";
    }

    public async Task<(IEnumerable<Signal> signals, int totalCount)> GetSignalsAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid? companyId = null,
        string[]? types = null,
        string[]? severities = null)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var whereConditions = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(search))
        {
            whereConditions.Add("(s.title ILIKE @search OR s.description ILIKE @search OR s.source ILIKE @search)");
            parameters.Add("search", $"%{search}%");
        }

        if (companyId.HasValue)
        {
            whereConditions.Add("s.company_id = @companyId");
            parameters.Add("companyId", companyId.Value);
        }

        if (types?.Length > 0)
        {
            whereConditions.Add("s.type = ANY(@types)");
            parameters.Add("types", types);
        }

        if (severities?.Length > 0)
        {
            whereConditions.Add("s.severity = ANY(@severities)");
            parameters.Add("severities", severities);
        }

        var whereClause = whereConditions.Count > 0 ? $"WHERE {string.Join(" AND ", whereConditions)}" : "";

        // Get total count
        var countQuery = $@"
            SELECT COUNT(*) 
            FROM signals s
            LEFT JOIN companies c ON s.company_id = c.id
            {whereClause}";

        var totalCount = await connection.QuerySingleAsync<int>(countQuery, parameters);

        // Get paginated results with company information
        var offset = (page - 1) * pageSize;
        parameters.Add("limit", pageSize);
        parameters.Add("offset", offset);

        var query = $@"
            SELECT 
                s.id,
                s.company_id,
                s.type,
                s.title,
                s.description,
                s.source,
                s.url,
                s.severity,
                s.tags,
                s.summary,
                s.detected_at,
                s.processed_at,
                c.id as company_id,
                c.name,
                c.domain,
                c.industry,
                c.location,
                c.headcount,
                c.funding_stage,
                c.summary as company_summary,
                c.investment_score,
                c.tags as company_tags,
                c.risk_flags,
                c.created_at as company_created_at,
                c.updated_at as company_updated_at
            FROM signals s
            LEFT JOIN companies c ON s.company_id = c.id
            {whereClause}
            ORDER BY s.detected_at DESC
            LIMIT @limit OFFSET @offset";

        var signalDict = new Dictionary<Guid, Signal>();

        var signals = await connection.QueryAsync<Signal, Company, Signal>(
            query,
            (signal, company) =>
            {
                if (!signalDict.TryGetValue(signal.Id, out var existingSignal))
                {
                    existingSignal = signal;
                    existingSignal.Company = company;
                    signalDict.Add(signal.Id, existingSignal);
                }
                return existingSignal;
            },
            parameters,
            splitOn: "company_id"
        );

        return (signalDict.Values, totalCount);
    }

    public async Task<Signal?> GetSignalByIdAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"
            SELECT 
                s.id,
                s.company_id,
                s.type,
                s.title,
                s.description,
                s.source,
                s.url,
                s.severity,
                s.tags,
                s.summary,
                s.detected_at,
                s.processed_at,
                c.id as company_id,
                c.name,
                c.domain,
                c.industry,
                c.location,
                c.headcount,
                c.funding_stage,
                c.summary as company_summary,
                c.investment_score,
                c.tags as company_tags,
                c.risk_flags,
                c.created_at as company_created_at,
                c.updated_at as company_updated_at
            FROM signals s
            LEFT JOIN companies c ON s.company_id = c.id
            WHERE s.id = @id";

        var signal = await connection.QueryAsync<Signal, Company, Signal>(
            query,
            (signal, company) =>
            {
                signal.Company = company;
                return signal;
            },
            new { id },
            splitOn: "company_id"
        );

        return signal.FirstOrDefault();
    }

    public async Task<Signal> CreateSignalAsync(Signal signal)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        signal.Id = Guid.NewGuid();
        signal.DetectedAt = DateTime.UtcNow;
        signal.ProcessedAt = DateTime.UtcNow;

        var query = @"
            INSERT INTO signals (
                id, company_id, type, title, description, source, url, 
                severity, tags, summary, detected_at, processed_at
            ) VALUES (
                @Id, @CompanyId, @Type, @Title, @Description, @Source, @Url,
                @Severity, @Tags, @Summary, @DetectedAt, @ProcessedAt
            ) RETURNING *";

        var createdSignal = await connection.QuerySingleAsync<Signal>(query, signal);
        return createdSignal;
    }

    public async Task<Signal?> UpdateSignalAsync(Guid id, Signal signal)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        signal.ProcessedAt = DateTime.UtcNow;

        var query = @"
            UPDATE signals SET
                company_id = @CompanyId,
                type = @Type,
                title = @Title,
                description = @Description,
                source = @Source,
                url = @Url,
                severity = @Severity,
                tags = @Tags,
                summary = @Summary,
                processed_at = @ProcessedAt
            WHERE id = @Id
            RETURNING *";

        signal.Id = id;
        var updatedSignal = await connection.QuerySingleOrDefaultAsync<Signal>(query, signal);
        return updatedSignal;
    }

    public async Task<bool> DeleteSignalAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "DELETE FROM signals WHERE id = @id";
        var affectedRows = await connection.ExecuteAsync(query, new { id });
        return affectedRows > 0;
    }
}
