namespace InvestorCodex.SyncService.Models;

public record Contact(
    string Name,
    string Title,
    string? Email,
    string? LinkedInUrl
);
