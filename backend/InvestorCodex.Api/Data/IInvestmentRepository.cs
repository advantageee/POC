using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Data;

public interface IInvestmentRepository
{
    Task<PaginatedResponse<Investment>> GetInvestmentsAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? companyId = null,
        string[]? rounds = null,
        decimal? minAmount = null,
        decimal? maxAmount = null);
    
    Task<Investment?> GetInvestmentByIdAsync(Guid id);
    Task<Investment> CreateInvestmentAsync(Investment investment);
    Task<Investment?> UpdateInvestmentAsync(Guid id, Investment investment);
    Task<bool> DeleteInvestmentAsync(Guid id);
}
