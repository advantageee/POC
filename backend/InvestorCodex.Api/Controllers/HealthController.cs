using Microsoft.AspNetCore.Mvc;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            Services = new
            {
                Database = "Not Connected", // Will be updated when DB is connected
                AzureOpenAI = "Not Configured",
                AzureCognitiveSearch = "Not Configured"
            }
        });
    }
}
