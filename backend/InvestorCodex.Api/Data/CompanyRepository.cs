using Dapper;
using InvestorCodex.Api.Models;
using Npgsql;
using System.Text;

namespace InvestorCodex.Api.Data;

public class CompanyRepository : ICompanyRepository
{
    private readonly string _connectionString;

    public CompanyRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("DefaultConnection not found");
    }

    public async Task<PaginatedResponse<Company>> GetCompaniesAsync(
        int page,
        int pageSize,
        string? search = null,
        string[]? industry = null,
        string[]? fundingStage = null,
        float? investmentScoreMin = null,
        float? investmentScoreMax = null,
        string[]? tags = null)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var whereConditions = new List<string>();
        var parameters = new DynamicParameters();

        // Build WHERE clause
        if (!string.IsNullOrEmpty(search))
        {
            whereConditions.Add("(name ILIKE @search OR industry ILIKE @search OR summary ILIKE @search)");
            parameters.Add("search", $"%{search}%");
        }

        if (industry != null && industry.Length > 0)
        {
            whereConditions.Add("industry = ANY(@industry)");
            parameters.Add("industry", industry);
        }

        if (fundingStage != null && fundingStage.Length > 0)
        {
            whereConditions.Add("funding_stage = ANY(@fundingStage)");
            parameters.Add("fundingStage", fundingStage);
        }

        if (investmentScoreMin.HasValue)
        {
            whereConditions.Add("investment_score >= @investmentScoreMin");
            parameters.Add("investmentScoreMin", investmentScoreMin.Value);
        }

        if (investmentScoreMax.HasValue)
        {
            whereConditions.Add("investment_score <= @investmentScoreMax");
            parameters.Add("investmentScoreMax", investmentScoreMax.Value);
        }

        if (tags != null && tags.Length > 0)
        {
            whereConditions.Add("tags && @tags");
            parameters.Add("tags", tags);
        }

        var whereClause = whereConditions.Count > 0 ? "WHERE " + string.Join(" AND ", whereConditions) : "";

        // Count query
        var countSql = $"SELECT COUNT(*) FROM companies {whereClause}";
        var totalItems = await connection.QuerySingleAsync<int>(countSql, parameters);

        // Data query
        var offset = (page - 1) * pageSize;
        parameters.Add("limit", pageSize);
        parameters.Add("offset", offset);

        var dataSql = $@"
            SELECT id, name, domain, industry, location, headcount, funding_stage as FundingStage, 
                   summary, investment_score as InvestmentScore, tags, risk_flags as RiskFlags,
                   created_at as CreatedAt, updated_at as UpdatedAt
            FROM companies 
            {whereClause}
            ORDER BY updated_at DESC
            LIMIT @limit OFFSET @offset";

        var companies = await connection.QueryAsync<Company>(dataSql, parameters);        return new PaginatedResponse<Company>
        {
            Data = companies.ToList(),
            Total = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
        };
    }

    public async Task<Company?> GetCompanyByIdAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var sql = @"
            SELECT id, name, domain, industry, location, headcount, funding_stage as FundingStage, 
                   summary, investment_score as InvestmentScore, tags, risk_flags as RiskFlags,
                   created_at as CreatedAt, updated_at as UpdatedAt
            FROM companies 
            WHERE id = @id";

        return await connection.QuerySingleOrDefaultAsync<Company>(sql, new { id });
    }

    public async Task<Company> CreateCompanyAsync(Company company)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        company.Id = Guid.NewGuid();
        company.CreatedAt = DateTime.UtcNow;
        company.UpdatedAt = DateTime.UtcNow;

        var sql = @"
            INSERT INTO companies (id, name, domain, industry, location, headcount, funding_stage, 
                                 summary, investment_score, tags, risk_flags, created_at, updated_at)
            VALUES (@Id, @Name, @Domain, @Industry, @Location, @Headcount, @FundingStage,
                   @Summary, @InvestmentScore, @Tags, @RiskFlags, @CreatedAt, @UpdatedAt)";

        await connection.ExecuteAsync(sql, company);
        return company;
    }

    public async Task<Company?> UpdateCompanyAsync(Guid id, Company company)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        company.Id = id;
        company.UpdatedAt = DateTime.UtcNow;

        var sql = @"
            UPDATE companies 
            SET name = @Name, domain = @Domain, industry = @Industry, location = @Location,
                headcount = @Headcount, funding_stage = @FundingStage, summary = @Summary,
                investment_score = @InvestmentScore, tags = @Tags, risk_flags = @RiskFlags,
                updated_at = @UpdatedAt
            WHERE id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, company);
        return rowsAffected > 0 ? company : null;
    }

    public async Task<bool> DeleteCompanyAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var sql = "DELETE FROM companies WHERE id = @id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { id });
        return rowsAffected > 0;
    }
}
