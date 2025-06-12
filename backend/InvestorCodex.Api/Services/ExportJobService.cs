using System.Collections.Concurrent;
using System.Text.Json;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Models;
using Microsoft.Extensions.Options;

namespace InvestorCodex.Api.Services;

public interface IExportJobService
{
    Task<List<ExportJob>> GetJobsAsync();
    Task<ExportJob?> GetJobAsync(Guid id);
    Task<ExportJob> EnqueueExportAsync(ExportRequest request);
    Task<bool> DeleteJobAsync(Guid id);
}

public class ExportJobService : IExportJobService
{
    private readonly ServiceBusClient _serviceBusClient;
    private readonly BlobContainerClient _containerClient;
    private readonly string _queueName;
    private readonly ConcurrentDictionary<Guid, (ExportJob Job, string BlobName)> _jobs = new();

    public ExportJobService(IOptions<ExportSettings> options)
    {
        var settings = options.Value;
        _serviceBusClient = new ServiceBusClient(settings.ServiceBusConnectionString);
        var blobServiceClient = new BlobServiceClient(settings.BlobConnectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(settings.ContainerName);
        _containerClient.CreateIfNotExists();
        _queueName = settings.QueueName;
    }

    public Task<List<ExportJob>> GetJobsAsync()
    {
        var tasks = _jobs.Values.Select(j => UpdateFromBlobAsync(j.Job, j.BlobName));
        return Task.WhenAll(tasks).ContinueWith(_ => _jobs.Values.Select(j => j.Job).ToList());
    }

    public async Task<ExportJob?> GetJobAsync(Guid id)
    {
        if (_jobs.TryGetValue(id, out var info))
        {
            await UpdateFromBlobAsync(info.Job, info.BlobName);
            return info.Job;
        }
        return null;
    }

    public async Task<ExportJob> EnqueueExportAsync(ExportRequest request)
    {
        var job = new ExportJob { Id = Guid.NewGuid(), Status = "queued", CreatedAt = DateTime.UtcNow };
        var blobName = $"{job.Id}.{request.Format}";
        _jobs[job.Id] = (job, blobName);

        var messageBody = JsonSerializer.Serialize(new
        {
            JobId = job.Id,
            Request = request,
            BlobName = blobName
        });

        var sender = _serviceBusClient.CreateSender(_queueName);
        await sender.SendMessageAsync(new ServiceBusMessage(messageBody));

        return job;
    }

    public async Task<bool> DeleteJobAsync(Guid id)
    {
        if (_jobs.TryRemove(id, out var info))
        {
            try
            {
                var blobClient = _containerClient.GetBlobClient(info.BlobName);
                await blobClient.DeleteIfExistsAsync();
            }
            catch
            {
                // ignore
            }
            return true;
        }
        return false;
    }

    private async Task UpdateFromBlobAsync(ExportJob job, string blobName)
    {
        if (job.Status == "completed")
            return;

        var blobClient = _containerClient.GetBlobClient(blobName);
        if (await blobClient.ExistsAsync())
        {
            job.Status = "completed";
            job.CompletedAt = job.CompletedAt ?? DateTime.UtcNow;
            job.DownloadUrl = blobClient.Uri.ToString();
        }
    }
}
