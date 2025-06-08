namespace InvestorCodex.Api.Models;

public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Total { get; set; }
    public int TotalPages { get; set; }
}

public class CompanyFilters
{
    public string? Search { get; set; }
    public string[]? Industry { get; set; }
    public string[]? FundingStage { get; set; }
    public float? InvestmentScoreMin { get; set; }
    public float? InvestmentScoreMax { get; set; }
    public int? HeadcountMin { get; set; }
    public int? HeadcountMax { get; set; }
    public string[]? Tags { get; set; }
    public string[]? RiskFlags { get; set; }
}
