namespace InvestorCodex.SyncService.Models;

public record Company(
    string Name,
    string Domain,
    string? Industry,
    int? Headcount,
    string? FundingStage
);
