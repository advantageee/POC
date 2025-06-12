using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Data;
using InvestorCodex.Api.Models;
using InvestorCodex.Api.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace InvestorCodex.Api.Tests;

public class SignalDetectionServiceTests
{
    private static SignalDetectionService CreateService(ISignalRepository repo)
    {
        var twitter = new Mock<ITwitterService>().Object;
        var context = new Mock<IContextFeedService>().Object;
        var companyRepo = new Mock<ICompanyRepository>().Object;
        var httpClient = new HttpClient();
        var options = Options.Create(new AdvantageAISettings());
        var logger = NullLogger<SignalDetectionService>.Instance;
        return new SignalDetectionService(twitter, context, repo, companyRepo, httpClient, options, logger);
    }

    [Fact]
    public async Task GetHighConfidenceSignalsAsync_ReturnsSignals_WhenDataExists()
    {
        // Arrange
        var signals = new List<Signal>
        {
            new Signal
            {
                Id = Guid.NewGuid(),
                Type = "Funding",
                Source = "techcrunch",
                Confidence = 0.8f,
                CreatedAt = DateTime.UtcNow
            },
            new Signal
            {
                Id = Guid.NewGuid(),
                Type = "Acquisition",
                Source = "twitter",
                Confidence = 0.9f,
                CreatedAt = DateTime.UtcNow
            }
        };

        var repoMock = new Mock<ISignalRepository>();
        repoMock.Setup(r => r.GetSignalsAsync(It.IsAny<int>(), It.IsAny<int>(), null, null, null, null))
            .ReturnsAsync((signals.AsEnumerable(), signals.Count));

        var service = CreateService(repoMock.Object);

        // Act
        var result = await service.GetHighConfidenceSignalsAsync();

        // Assert
        Assert.Equal(signals.Count, result.Count);
        Assert.All(signals, s => Assert.Contains(result, r => r.Id == s.Id));
    }

    [Fact]
    public async Task GetHighConfidenceSignalsAsync_ReturnsEmpty_WhenNoSignals()
    {
        // Arrange
        var repoMock = new Mock<ISignalRepository>();
        repoMock.Setup(r => r.GetSignalsAsync(It.IsAny<int>(), It.IsAny<int>(), null, null, null, null))
            .ReturnsAsync((Enumerable.Empty<Signal>(), 0));

        var service = CreateService(repoMock.Object);

        // Act
        var result = await service.GetHighConfidenceSignalsAsync();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetHighConfidenceSignalsAsync_ReturnsEmpty_WhenRepositoryFails()
    {
        // Arrange
        var repoMock = new Mock<ISignalRepository>();
        repoMock.Setup(r => r.GetSignalsAsync(It.IsAny<int>(), It.IsAny<int>(), null, null, null, null))
            .ThrowsAsync(new Exception("table missing"));

        var service = CreateService(repoMock.Object);

        // Act
        var result = await service.GetHighConfidenceSignalsAsync();

        // Assert
        Assert.Empty(result);
    }
}
