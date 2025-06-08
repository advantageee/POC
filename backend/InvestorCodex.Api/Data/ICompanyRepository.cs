using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Data;

public interface ICompanyRepository
{
    Task<PaginatedResponse<Company>> GetCompaniesAsync(
        int page,
        int pageSize,
        string? search = null,
        string[]? industry = null,
        string[]? fundingStage = null,
        float? investmentScoreMin = null,
        float? investmentScoreMax = null,
        string[]? tags = null);
    
    Task<Company?> GetCompanyByIdAsync(Guid id);
    Task<Company> CreateCompanyAsync(Company company);
    Task<Company?> UpdateCompanyAsync(Guid id, Company company);
    Task<bool> DeleteCompanyAsync(Guid id);
}
