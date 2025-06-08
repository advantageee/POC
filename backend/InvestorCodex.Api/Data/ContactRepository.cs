using Dapper;
using InvestorCodex.Api.Models;
using Npgsql;

namespace InvestorCodex.Api.Data;

public class ContactRepository : IContactRepository
{
    private readonly string _connectionString;

    public ContactRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("DefaultConnection not found");
    }

    public async Task<PaginatedResponse<Contact>> GetContactsAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? companyId = null,
        string[]? personas = null)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var whereConditions = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(search))
        {
            whereConditions.Add("(name ILIKE @search OR title ILIKE @search OR email ILIKE @search)");
            parameters.Add("search", $"%{search}%");
        }

        if (companyId.HasValue)
        {
            whereConditions.Add("company_id = @companyId");
            parameters.Add("companyId", companyId.Value);
        }

        if (personas != null && personas.Length > 0)
        {
            whereConditions.Add("persona = ANY(@personas)");
            parameters.Add("personas", personas);
        }

        var whereClause = whereConditions.Count > 0 ? "WHERE " + string.Join(" AND ", whereConditions) : "";

        // Count query
        var countSql = $"SELECT COUNT(*) FROM contacts {whereClause}";
        var totalItems = await connection.QuerySingleAsync<int>(countSql, parameters);

        // Data query
        var offset = (page - 1) * pageSize;
        parameters.Add("limit", pageSize);
        parameters.Add("offset", offset);

        var dataSql = $@"
            SELECT id, company_id as CompanyId, name, title, email, linkedin_url as LinkedInUrl,
                   persona, summary, created_at as CreatedAt, updated_at as UpdatedAt
            FROM contacts 
            {whereClause}
            ORDER BY updated_at DESC
            LIMIT @limit OFFSET @offset";

        var contacts = await connection.QueryAsync<Contact>(dataSql, parameters);

        return new PaginatedResponse<Contact>
        {
            Items = contacts.ToArray(),
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
        };
    }

    public async Task<Contact?> GetContactByIdAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var sql = @"
            SELECT id, company_id as CompanyId, name, title, email, linkedin_url as LinkedInUrl,
                   persona, summary, created_at as CreatedAt, updated_at as UpdatedAt
            FROM contacts 
            WHERE id = @id";

        return await connection.QuerySingleOrDefaultAsync<Contact>(sql, new { id });
    }

    public async Task<Contact> CreateContactAsync(Contact contact)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        contact.Id = Guid.NewGuid();
        contact.CreatedAt = DateTime.UtcNow;
        contact.UpdatedAt = DateTime.UtcNow;

        var sql = @"
            INSERT INTO contacts (id, company_id, name, title, email, linkedin_url, persona, summary, created_at, updated_at)
            VALUES (@Id, @CompanyId, @Name, @Title, @Email, @LinkedInUrl, @Persona, @Summary, @CreatedAt, @UpdatedAt)";

        await connection.ExecuteAsync(sql, contact);
        return contact;
    }

    public async Task<Contact?> UpdateContactAsync(Guid id, Contact contact)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        contact.Id = id;
        contact.UpdatedAt = DateTime.UtcNow;

        var sql = @"
            UPDATE contacts 
            SET company_id = @CompanyId, name = @Name, title = @Title, email = @Email,
                linkedin_url = @LinkedInUrl, persona = @Persona, summary = @Summary, updated_at = @UpdatedAt
            WHERE id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, contact);
        return rowsAffected > 0 ? contact : null;
    }

    public async Task<bool> DeleteContactAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        
        var sql = "DELETE FROM contacts WHERE id = @id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { id });
        return rowsAffected > 0;
    }
}
