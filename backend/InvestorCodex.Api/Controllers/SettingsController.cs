using Microsoft.AspNetCore.Mvc;
using InvestorCodex.Api.Configuration;

using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;
using Microsoft.AspNetCore.Mvc;


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

    private readonly ISettingsService _service;

    public SettingsController(ISettingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<SettingsDto> Get()
    {
        return Ok(_service.GetSettings());
    }

    [HttpPut]
    public IActionResult Update([FromBody] SettingsDto dto)
    {
        _service.UpdateSettings(dto);
        return NoContent();
    }
}
