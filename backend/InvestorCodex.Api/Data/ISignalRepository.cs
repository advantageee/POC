using InvestorCodex.Api.Models;

namespace InvestorCodex.Api.Data;

public interface ISignalRepository
{
    Task<(IEnumerable<Signal> signals, int totalCount)> GetSignalsAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid? companyId = null,
        string[]? types = null,
        string[]? severities = null);
    
    Task<Signal?> GetSignalByIdAsync(Guid id);
    Task<Signal> CreateSignalAsync(Signal signal);
    Task<Signal?> UpdateSignalAsync(Guid id, Signal signal);
    Task<bool> DeleteSignalAsync(Guid id);
}
