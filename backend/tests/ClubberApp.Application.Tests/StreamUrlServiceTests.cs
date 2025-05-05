using ClubberApp.Application.Services;
using ClubberApp.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

// Alias for Domain Match to avoid ambiguity with Moq.Match
using DomainMatch = ClubberApp.Domain.Entities.Match;

namespace ClubberApp.Application.Tests;

public class StreamUrlServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly StreamUrlService _streamUrlService;

    public StreamUrlServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        SetupMockConfiguration();
        _streamUrlService = new StreamUrlService(_mockConfiguration.Object);
    }

    private void SetupMockConfiguration()
    {
        var mockBaseUrl = "https://test-stream.example.com/";
        var mockLivePath = "live/";
        var mockReplayPath = "ondemand/";

        _mockConfiguration.Setup(c => c["StreamSettings:BaseUrl"])
            .Returns(mockBaseUrl);
        _mockConfiguration.Setup(c => c["StreamSettings:LivePath"])
            .Returns(mockLivePath);
        _mockConfiguration.Setup(c => c["StreamSettings:ReplayPath"])
            .Returns(mockReplayPath);
    }

    [Fact]
    public void GenerateStreamUrl_WithMatchObject_ShouldGenerateCorrectUrlForLiveMatch()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var match = new DomainMatch 
        { 
            Id = matchId, 
            Title = "Test Match", 
            Status = MatchStatus.Live,
            Availability = MatchAvailability.Available
        };
        var expectedUrl = $"https://test-stream.example.com/live/{matchId}";

        // Act
        var resultUrl = _streamUrlService.GenerateStreamUrl(match);

        // Assert
        Assert.Equal(expectedUrl, resultUrl);
    }

    [Fact]
    public void GenerateStreamUrl_WithMatchObject_ShouldReturnEmptyStringForUnavailableMatch()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var match = new DomainMatch 
        { 
            Id = matchId, 
            Title = "Test Match", 
            Status = MatchStatus.Live,
            Availability = MatchAvailability.Unavailable
        };

        // Act
        var resultUrl = _streamUrlService.GenerateStreamUrl(match);

        // Assert
        Assert.Equal(string.Empty, resultUrl);
    }

    [Fact]
    public void GenerateStreamUrl_WithMatchObject_ShouldGenerateCorrectUrlForOnDemandMatch()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var match = new DomainMatch 
        { 
            Id = matchId, 
            Title = "Test Match", 
            Status = MatchStatus.OnDemand,
            Availability = MatchAvailability.Available
        };
        var expectedUrl = $"https://test-stream.example.com/ondemand/{matchId}";

        // Act
        var resultUrl = _streamUrlService.GenerateStreamUrl(match);

        // Assert
        Assert.Equal(expectedUrl, resultUrl);
    }

    [Fact]
    public void GenerateStreamUrl_WithIdAndStatus_ShouldGenerateCorrectUrl()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var status = MatchStatus.Live;
        var expectedUrl = $"https://test-stream.example.com/live/{matchId}";

        // Act
        var resultUrl = _streamUrlService.GenerateStreamUrl(matchId, status);

        // Assert
        Assert.Equal(expectedUrl, resultUrl);
    }
} 