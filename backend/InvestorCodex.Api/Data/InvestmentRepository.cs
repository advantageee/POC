using Dapper;
using InvestorCodex.Api.Models;
using Npgsql;

namespace InvestorCodex.Api.Data;

public class InvestmentRepository : IInvestmentRepository
{
    private readonly string _connectionString;

    public InvestmentRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("DefaultConnection not found");
    }

    public async Task<PaginatedResponse<Investment>> GetInvestmentsAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? companyId = null,
        string[]? rounds = null,
        decimal? minAmount = null,
        decimal? maxAmount = null)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var whereConditions = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(search))
        {
            whereConditions.Add("(i.round ILIKE @search OR i.summary ILIKE @search OR c.name ILIKE @search)");
            parameters.Add("search", $"%{search}%");
        }

        if (companyId.HasValue)
        {
            whereConditions.Add("i.company_id = @companyId");
            parameters.Add("companyId", companyId.Value);
        }

        if (rounds != null && rounds.Length > 0)
        {
            whereConditions.Add("i.round = ANY(@rounds)");
            parameters.Add("rounds", rounds);
        }

        if (minAmount.HasValue)
        {
            whereConditions.Add("i.amount >= @minAmount");
            parameters.Add("minAmount", minAmount.Value);
        }

        if (maxAmount.HasValue)
        {
            whereConditions.Add("i.amount <= @maxAmount");
            parameters.Add("maxAmount", maxAmount.Value);
        }

        var whereClause = whereConditions.Count > 0 ? "WHERE " + string.Join(" AND ", whereConditions) : "";

        // Count query
        var countSql = $@"
            SELECT COUNT(*) 
            FROM investments i
            LEFT JOIN companies c ON i.company_id = c.id
            {whereClause}";
        var totalItems = await connection.QuerySingleAsync<int>(countSql, parameters);

        // Data query
        var offset = (page - 1) * pageSize;
        parameters.Add("limit", pageSize);
        parameters.Add("offset", offset);

        var dataSql = $@"
            SELECT i.id, i.company_id as CompanyId, i.round, i.amount, i.currency,
                   i.filing_date as FilingDate, i.source, i.url, i.summary,
                   i.investment_score as InvestmentScore, i.filing_type as FilingType,
                   c.name as Company, i.created_at as CreatedAt, i.updated_at as UpdatedAt
            FROM investments i
            LEFT JOIN companies c ON i.company_id = c.id
            {whereClause}
            ORDER BY i.filing_date DESC
            LIMIT @limit OFFSET @offset";

        var investments = await connection.QueryAsync<Investment>(dataSql, parameters);

        return new PaginatedResponse<Investment>
        {
            Items = investments.ToArray(),
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
        };
    }

    public async Task<Investment?> GetInvestmentByIdAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var sql = @"
            SELECT i.id, i.company_id as CompanyId, i.round, i.amount, i.currency,
                   i.filing_date as FilingDate, i.source, i.url, i.summary,
                   i.investment_score as InvestmentScore, i.filing_type as FilingType,
                   c.name as Company, i.created_at as CreatedAt, i.updated_at as UpdatedAt
            FROM investments i
            LEFT JOIN companies c ON i.company_id = c.id
            WHERE i.id = @id";

        return await connection.QuerySingleOrDefaultAsync<Investment>(sql, new { id });
    }

    public async Task<Investment> CreateInvestmentAsync(Investment investment)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        investment.Id = Guid.NewGuid();
        investment.CreatedAt = DateTime.UtcNow;
        investment.UpdatedAt = DateTime.UtcNow;

        var sql = @"
            INSERT INTO investments (id, company_id, round, amount, currency, filing_date, source, url,
                                   summary, investment_score, filing_type, created_at, updated_at)
            VALUES (@Id, @CompanyId, @Round, @Amount, @Currency, @FilingDate, @Source, @Url,
                   @Summary, @InvestmentScore, @FilingType, @CreatedAt, @UpdatedAt)";

        await connection.ExecuteAsync(sql, investment);
        return investment;
    }

    public async Task<Investment?> UpdateInvestmentAsync(Guid id, Investment investment)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        investment.Id = id;
        investment.UpdatedAt = DateTime.UtcNow;

        var sql = @"
            UPDATE investments 
            SET company_id = @CompanyId, round = @Round, amount = @Amount, currency = @Currency,
                filing_date = @FilingDate, source = @Source, url = @Url, summary = @Summary,
                investment_score = @InvestmentScore, filing_type = @FilingType, updated_at = @UpdatedAt
            WHERE id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, investment);
        return rowsAffected > 0 ? investment : null;
    }

    public async Task<bool> DeleteInvestmentAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var sql = "DELETE FROM investments WHERE id = @id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { id });
        return rowsAffected > 0;
    }
}
