using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Repositories;
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
    private readonly MatchService _matchService;

    public MatchServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockMatchRepository = new Mock<IMatchRepository>();
        _mockMapper = new Mock<IMapper>();

        _mockUnitOfWork.Setup(uow => uow.MatchRepository).Returns(_mockMatchRepository.Object);

        _matchService = new MatchService(_mockUnitOfWork.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task GetAllMatchesAsync_ShouldReturnMappedMatches()
    {
        // Arrange
        var matchId1 = Guid.NewGuid();
        var matchId2 = Guid.NewGuid();
        var matches = new List<DomainMatch> // Use alias
        {
            new DomainMatch { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = MatchStatus.Replay },
            new DomainMatch { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = MatchStatus.Live }
        };
        var matchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = "Replay" },
            new MatchDto { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = "Live" }
        };

        _mockMatchRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(matches);
        _mockMapper.Setup(m => m.Map<IEnumerable<MatchDto>>(matches)).Returns(matchDtos);

        // Act
        var result = await _matchService.GetAllMatchesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.Equal(matchDtos, result);
        _mockMatchRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<MatchDto>>(matches), Times.Once);
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
            new DomainMatch { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = MatchStatus.Replay },
            new DomainMatch { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = MatchStatus.Live },
            new DomainMatch { Id = matchId3, Title = "Match 3", Competition = "Comp C", Status = MatchStatus.Live }
        };
        var liveMatches = allMatches.Where(m => m.Status == statusToFetch).ToList();
        var liveMatchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = "Live" },
            new MatchDto { Id = matchId3, Title = "Match 3", Competition = "Comp C", Status = "Live" }
        };

        // Mock the specific repository method being called by the service
        _mockMatchRepository.Setup(repo => repo.GetMatchesByStatusAsync(statusToFetch))
                           .ReturnsAsync(liveMatches);
        _mockMapper.Setup(m => m.Map<IEnumerable<MatchDto>>(liveMatches)).Returns(liveMatchDtos);

        // Act
        var result = await _matchService.GetMatchesByStatusAsync(statusToFetch);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.Equal(liveMatchDtos, result);
        _mockMatchRepository.Verify(repo => repo.GetMatchesByStatusAsync(statusToFetch), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<MatchDto>>(liveMatches), Times.Once);
    }

    [Fact]
    public async Task GetMatchByIdAsync_ShouldReturnMatch_WhenMatchExists()
    {
        // Arrange
        var matchId = Guid.NewGuid(); // Use Guid
        var match = new DomainMatch { Id = matchId, Title = "Match 1", Competition = "Comp A", Status = MatchStatus.Replay }; // Use alias and correct properties
        var matchDto = new MatchDto { Id = matchId, Title = "Match 1", Competition = "Comp A", Status = "Replay" };

        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync(match);
        _mockMapper.Setup(m => m.Map<MatchDto>(match)).Returns(matchDto);

        // Act
        var result = await _matchService.GetMatchByIdAsync(matchId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(matchDto, result);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        _mockMapper.Verify(m => m.Map<MatchDto>(match), Times.Once);
    }

    [Fact]
    public async Task GetMatchByIdAsync_ShouldReturnNull_WhenMatchDoesNotExist()
    {
        // Arrange
        var matchId = Guid.NewGuid(); // Use Guid
        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync((DomainMatch?)null); // Use alias
        // Mock the mapper to return null when input is null
        _mockMapper.Setup(m => m.Map<MatchDto>((DomainMatch?)null)).Returns((MatchDto?)null);

        // Act
        var result = await _matchService.GetMatchByIdAsync(matchId);

        // Assert
        Assert.Null(result);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        // Verify that the mapper was called once, even with null
        _mockMapper.Verify(m => m.Map<MatchDto>((DomainMatch?)null), Times.Once);
    }

    // Add tests for CreateMatchAsync, UpdateMatchAsync, DeleteMatchAsync, SearchMatchesAsync
}

