using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Configuration;

namespace InvestorCodex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    [HttpGet("vector-db")]
    public ActionResult<VectorDbSettings> GetVectorDb()
    {
        return Ok(RuntimeSettingsStore.VectorDb);
    }

    [HttpPost("vector-db")]
    public ActionResult SetVectorDb([FromBody] VectorDbSettings settings)
    {
        RuntimeSettingsStore.VectorDb = settings;
        return Ok();
    }

    [HttpGet("blob-storage")]
    public ActionResult<BlobStorageSettings> GetBlobStorage()
    {
        return Ok(RuntimeSettingsStore.BlobStorage);
    }

    [HttpPost("blob-storage")]
    public ActionResult SetBlobStorage([FromBody] BlobStorageSettings settings)
    {
        RuntimeSettingsStore.BlobStorage = settings;
        return Ok();
    }
}
