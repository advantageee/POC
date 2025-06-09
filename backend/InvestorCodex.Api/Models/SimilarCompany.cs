namespace InvestorCodex.Api.Models;

public class SimilarCompany
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Domain { get; set; }
    public string? Industry { get; set; }
    public float Similarity { get; set; }
    public float SimilarityScore { get; set; }
    public string? Summary { get; set; }
    public string? Description { get; set; }
    public float? InvestmentScore { get; set; }
}
