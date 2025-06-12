using Dapper;
using InvestorCodex.Api.Models;
using Npgsql;

namespace InvestorCodex.Api.Data;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not found");
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        using var connection = new NpgsqlConnection(_connectionString);
        var sql = @"SELECT id, email, name, roles, last_login_at as LastLoginAt, created_at as CreatedAt FROM users ORDER BY created_at DESC";
        var users = await connection.QueryAsync<User>(sql);
        return users;
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        var sql = @"SELECT id, email, name, roles, last_login_at as LastLoginAt, created_at as CreatedAt FROM users WHERE id = @id";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { id });
    }

    public async Task<User> CreateUserAsync(User user)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        var sql = @"INSERT INTO users (id, email, name, roles, last_login_at, created_at) VALUES (@Id, @Email, @Name, @Roles, @LastLoginAt, @CreatedAt)";
        await connection.ExecuteAsync(sql, user);
        return user;
    }

    public async Task<User?> UpdateUserAsync(Guid id, User user)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        user.Id = id;
        var sql = @"UPDATE users SET email=@Email, name=@Name, roles=@Roles, last_login_at=@LastLoginAt WHERE id=@Id";
        var rows = await connection.ExecuteAsync(sql, user);
        return rows > 0 ? user : null;
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        var sql = "DELETE FROM users WHERE id = @id";
        var rows = await connection.ExecuteAsync(sql, new { id });
        return rows > 0;
    }
}
