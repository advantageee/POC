using InvestorCodex.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private static VectorDbSettings _vectorDb = new();
    private static BlobStorageSettings _blobStorage = new();
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(IOptions<VectorDbSettings> vectorDb,
                              IOptions<BlobStorageSettings> blobStorage,
                              ILogger<SettingsController> logger)
    {
        if (string.IsNullOrEmpty(_vectorDb.Endpoint))
        {
            _vectorDb = vectorDb.Value;
        }
        if (string.IsNullOrEmpty(_blobStorage.ConnectionString))
        {
            _blobStorage = blobStorage.Value;
        }
        _logger = logger;
    }

    [HttpGet("vector-db")]
    public ActionResult<VectorDbSettings> GetVectorDb() => Ok(_vectorDb);

    [HttpPost("vector-db")]
    public ActionResult SaveVectorDb([FromBody] VectorDbSettings settings)
    {
        _vectorDb = settings;
        _logger.LogInformation("Vector DB settings updated");
        return Ok();
    }

    [HttpGet("blob-storage")]
    public ActionResult<BlobStorageSettings> GetBlobStorage() => Ok(_blobStorage);

    [HttpPost("blob-storage")]
    public ActionResult SaveBlobStorage([FromBody] BlobStorageSettings settings)
    {
        _blobStorage = settings;
        _logger.LogInformation("Blob storage settings updated");
        return Ok();
    }
}
