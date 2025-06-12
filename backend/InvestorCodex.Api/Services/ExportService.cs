using System.Collections.Concurrent;
using System.Text.Json;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Models;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface IExportService
{
    Task<ExportJob> QueueExportAsync(ExportRequest request);
    Task<ExportJob?> GetJobAsync(Guid id);
    Task<List<ExportJob>> GetJobsAsync();
    Task<bool> DeleteJobAsync(Guid id);
}

public class ExportService : IExportService
{
    private readonly ServiceBusClient _busClient;
    private readonly BlobContainerClient _container;
    private readonly ConcurrentDictionary<Guid, ExportJob> _jobs = new();
    private readonly ExportSettings _settings;

    public ExportService(IOptions<ExportSettings> settings)
    {
        _settings = settings.Value;
        _busClient = new ServiceBusClient(_settings.ServiceBusConnectionString);
        _container = new BlobContainerClient(_settings.BlobConnectionString, _settings.ContainerName);
        _container.CreateIfNotExists();
    }

    public async Task<ExportJob> QueueExportAsync(ExportRequest request)
    {
        var job = new ExportJob
        {
            Id = Guid.NewGuid(),
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            Format = request.Format,
            Type = request.Type
        };

        _jobs[job.Id] = job;

        var sender = _busClient.CreateSender(_settings.QueueName);
        var payload = JsonSerializer.Serialize(new { JobId = job.Id, Request = request });
        await sender.SendMessageAsync(new ServiceBusMessage(payload));

        return job;
    }

    public async Task<ExportJob?> GetJobAsync(Guid id)
    {
        if (!_jobs.TryGetValue(id, out var job))
            return null;

        await UpdateStatusAsync(job);
        return job;
    }

    public async Task<List<ExportJob>> GetJobsAsync()
    {
        var list = _jobs.Values.ToList();
        foreach (var job in list)
        {
            await UpdateStatusAsync(job);
        }

        return list.OrderByDescending(j => j.CreatedAt).ToList();
    }

    public async Task<bool> DeleteJobAsync(Guid id)
    {
        var removed = _jobs.TryRemove(id, out _);

        await _container.DeleteBlobIfExistsAsync($"{id}.csv");
        await _container.DeleteBlobIfExistsAsync($"{id}.pdf");

        return removed;
    }

    private async Task UpdateStatusAsync(ExportJob job)
    {
        if (job.Status == "completed" || job.Status == "failed")
            return;

        foreach (var ext in new[] { "csv", "pdf" })
        {
            var blobClient = _container.GetBlobClient($"{job.Id}.{ext}");
            if (await blobClient.ExistsAsync())
            {
                job.Status = "completed";
                job.CompletedAt ??= DateTime.UtcNow;
                job.DownloadUrl = GenerateSasUrl(blobClient);
                break;
            }
        }
    }

    private string GenerateSasUrl(BlobClient blobClient)
    {
        if (!blobClient.CanGenerateSasUri)
            return blobClient.Uri.ToString();

        var sas = new BlobSasBuilder
        {
            BlobContainerName = blobClient.BlobContainerName,
            BlobName = blobClient.Name,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
        };
        sas.SetPermissions(BlobSasPermissions.Read);
        return blobClient.GenerateSasUri(sas).ToString();
    }
}
