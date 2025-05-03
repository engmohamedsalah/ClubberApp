using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Application.Services;
using ClubberApp.Domain.Entities; // Use the domain entities
using Moq;
using System.Linq.Expressions;
using Xunit;

// Alias for Domain Match to avoid ambiguity with Moq.Match
using DomainMatch = ClubberApp.Domain.Entities.Match;

namespace ClubberApp.Application.Tests;

public class MatchServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IMatchRepository> _mockMatchRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<IStreamUrlService> _mockStreamUrlService;
    private readonly MatchService _matchService;

    public MatchServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockMatchRepository = new Mock<IMatchRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockStreamUrlService = new Mock<IStreamUrlService>();

        _mockUnitOfWork.Setup(uow => uow.MatchRepository).Returns(_mockMatchRepository.Object);

        _matchService = new MatchService(_mockUnitOfWork.Object, _mockMapper.Object, _mockStreamUrlService.Object);
    }

    [Fact]
    public async Task GetAllMatchesAsync_ShouldReturnMappedMatches()
    {
        // Arrange
        var matchId1 = Guid.NewGuid();
        var matchId2 = Guid.NewGuid();
        var matches = new List<DomainMatch> // Use alias
        {
            new DomainMatch { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = MatchStatus.Replay, StreamURL = "" },
            new DomainMatch { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = MatchStatus.Live, StreamURL = "" }
        };
        var matchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = "Replay", StreamURL = "" },
            new MatchDto { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = "Live", StreamURL = "" }
        };

        _mockMatchRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(matches);
        _mockMapper.Setup(m => m.Map<IEnumerable<MatchDto>>(matches)).Returns(matchDtos);
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()))
            .Returns<DomainMatch>(m => $"https://stream.example.com/{m.Status.ToString().ToLower()}/{m.Id}");

        // Act
        var result = await _matchService.GetAllMatchesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockMatchRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<MatchDto>>(matches), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Exactly(2));
    }

    [Fact]
    public async Task GetMatchesByStatusAsync_ShouldReturnCorrectMatches()
    {
        // Arrange
        var matchId1 = Guid.NewGuid();
        var matchId2 = Guid.NewGuid();
        var matchId3 = Guid.NewGuid();
        var statusToFetch = MatchStatus.Live;

        var allMatches = new List<DomainMatch>
        {
            new DomainMatch { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = MatchStatus.Replay, StreamURL = "" },
            new DomainMatch { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = MatchStatus.Live, StreamURL = "" },
            new DomainMatch { Id = matchId3, Title = "Match 3", Competition = "Comp C", Status = MatchStatus.Live, StreamURL = "" }
        };
        var liveMatches = allMatches.Where(m => m.Status == statusToFetch).ToList();
        var liveMatchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = "Live", StreamURL = "" },
            new MatchDto { Id = matchId3, Title = "Match 3", Competition = "Comp C", Status = "Live", StreamURL = "" }
        };

        // Mock the specific repository method being called by the service
        _mockMatchRepository.Setup(repo => repo.GetMatchesByStatusAsync(statusToFetch))
                           .ReturnsAsync(liveMatches);
        _mockMapper.Setup(m => m.Map<IEnumerable<MatchDto>>(liveMatches)).Returns(liveMatchDtos);
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()))
            .Returns<DomainMatch>(m => $"https://stream.example.com/{m.Status.ToString().ToLower()}/{m.Id}");

        // Act
        var result = await _matchService.GetMatchesByStatusAsync(statusToFetch);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockMatchRepository.Verify(repo => repo.GetMatchesByStatusAsync(statusToFetch), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<MatchDto>>(liveMatches), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Exactly(2));
    }

    [Fact]
    public async Task GetMatchByIdAsync_ShouldReturnMatch_WhenMatchExists()
    {
        // Arrange
        var matchId = Guid.NewGuid(); // Use Guid
        var match = new DomainMatch { Id = matchId, Title = "Match 1", Competition = "Comp A", Status = MatchStatus.Replay, StreamURL = "" }; // Use alias and correct properties
        var matchDto = new MatchDto { Id = matchId, Title = "Match 1", Competition = "Comp A", Status = "Replay", StreamURL = "" };
        var generatedStreamUrl = $"https://stream.example.com/replay/{matchId}";

        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync(match);
        _mockMapper.Setup(m => m.Map<MatchDto>(match)).Returns(matchDto);
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(match)).Returns(generatedStreamUrl);

        // Act
        var result = await _matchService.GetMatchByIdAsync(matchId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(matchDto.Id, result.Id);
        Assert.Equal(generatedStreamUrl, result.StreamURL);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        _mockMapper.Verify(m => m.Map<MatchDto>(match), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(match), Times.Once);
    }

    [Fact]
    public async Task GetMatchByIdAsync_ShouldReturnNull_WhenMatchDoesNotExist()
    {
        // Arrange
        var matchId = Guid.NewGuid(); // Use Guid
        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync((DomainMatch?)null); // Use alias

        // Act
        var result = await _matchService.GetMatchByIdAsync(matchId);

        // Assert
        Assert.Null(result);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Never);
    }

    [Fact]
    public async Task CreateMatchAsync_ShouldGenerateStreamUrlAndSave()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var createDto = new MatchCreateDto 
        { 
            Name = "New Match", 
            Sport = "Football", 
            Date = DateTime.Now.AddDays(1), 
            Status = "Live",
            StreamURL = "" 
        };
        var match = new DomainMatch 
        { 
            Id = matchId, 
            Title = "New Match", 
            Competition = "Football", 
            Status = MatchStatus.Live,
            StreamURL = "" 
        };
        var matchDto = new MatchDto 
        { 
            Id = matchId, 
            Title = "New Match", 
            Competition = "Football", 
            Status = "Live",
            StreamURL = "" 
        };
        var generatedStreamUrl = $"https://stream.example.com/live/{matchId}";

        _mockMapper.Setup(m => m.Map<DomainMatch>(createDto)).Returns(match);
        _mockMapper.Setup(m => m.Map<MatchDto>(match)).Returns(matchDto);
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(match)).Returns(generatedStreamUrl);
        _mockMatchRepository.Setup(r => r.AddAsync(match)).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        var result = await _matchService.CreateMatchAsync(createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(matchId, result.Id);
        Assert.Equal(generatedStreamUrl, match.StreamURL);
        _mockMapper.Verify(m => m.Map<DomainMatch>(createDto), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(match), Times.Once);
        _mockMatchRepository.Verify(r => r.AddAsync(match), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    // Add test for UpdateMatchAsync with StreamURL
    [Fact]
    public async Task UpdateMatchAsync_ShouldGenerateStreamUrlIfEmptyAndUpdate()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var updateDto = new MatchUpdateDto 
        { 
            Name = "Updated Match", 
            Sport = "Basketball", 
            Date = DateTime.Now.AddDays(2), 
            Status = "Replay",
            StreamURL = "" 
        };
        var existingMatch = new DomainMatch 
        { 
            Id = matchId, 
            Title = "Old Match", 
            Competition = "Football", 
            Status = MatchStatus.Live,
            StreamURL = "" 
        };
        var generatedStreamUrl = $"https://stream.example.com/replay/{matchId}";

        _mockMatchRepository.Setup(r => r.GetByIdAsync(matchId)).ReturnsAsync(existingMatch);
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>())).Returns(generatedStreamUrl);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        var result = await _matchService.UpdateMatchAsync(matchId, updateDto);

        // Assert
        Assert.True(result);
        Assert.Equal(generatedStreamUrl, existingMatch.StreamURL);
        _mockMatchRepository.Verify(r => r.GetByIdAsync(matchId), Times.Once);
        _mockMapper.Verify(m => m.Map(updateDto, existingMatch), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(existingMatch), Times.Once);
        _mockMatchRepository.Verify(r => r.Update(existingMatch), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }
}

