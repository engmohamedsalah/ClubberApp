using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Enums;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Application.Services;
using ClubberApp.Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

// Alias for Domain Match to avoid ambiguity with Moq.Match
using DomainMatch = ClubberApp.Domain.Entities.Match;

namespace ClubberApp.Application.Tests;

public class PlaylistServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IPlaylistRepository> _mockPlaylistRepository;
    private readonly Mock<IMatchRepository> _mockMatchRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly PlaylistService _playlistService;

    public PlaylistServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockPlaylistRepository = new Mock<IPlaylistRepository>();
        _mockMatchRepository = new Mock<IMatchRepository>();
        _mockMapper = new Mock<IMapper>();

        // Setup UnitOfWork to return mocked repositories
        _mockUnitOfWork.Setup(uow => uow.PlaylistRepository).Returns(_mockPlaylistRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.MatchRepository).Returns(_mockMatchRepository.Object);

        _playlistService = new PlaylistService(_mockUnitOfWork.Object, _mockMapper.Object);

        // Setup AutoMapper mock
        _mockMapper.Setup(m => m.Map<IEnumerable<MatchDto>>(It.IsAny<IEnumerable<DomainMatch>>())) // Use alias
                   .Returns((IEnumerable<DomainMatch> source) => source.Select(m => new MatchDto { 
                       Id = m.Id, 
                       Title = m.Title, 
                       Competition = m.Competition, 
                       Date = m.Date, 
                       Status = m.Status == Domain.Entities.MatchStatus.Live ? 
                           Application.Enums.MatchStatus.InProgress : 
                           Application.Enums.MatchStatus.Completed,
                       Availability = Application.Enums.MatchAvailability.Available
                   }).ToList());
                   
        _mockMapper.Setup(m => m.Map<List<MatchDto>>(It.IsAny<IEnumerable<DomainMatch>>())) // Use alias
                   .Returns((IEnumerable<DomainMatch> source) => source.Select(m => new MatchDto { 
                       Id = m.Id, 
                       Title = m.Title, 
                       Competition = m.Competition, 
                       Date = m.Date, 
                       Status = m.Status == Domain.Entities.MatchStatus.Live ? 
                           Application.Enums.MatchStatus.InProgress : 
                           Application.Enums.MatchStatus.Completed,
                       Availability = Application.Enums.MatchAvailability.Available
                   }).ToList());
    }

    [Fact]
    public async Task GetPlaylistByUserIdAsync_ShouldReturnPlaylistDtoWithMatches_WhenUserHasMatches()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var matches = new List<DomainMatch> // Use alias
        {
            new DomainMatch { Id = Guid.NewGuid(), Title = "Match 1", Competition = "Comp A", Date = DateTime.UtcNow, Status = Domain.Entities.MatchStatus.Live },
            new DomainMatch { Id = Guid.NewGuid(), Title = "Match 2", Competition = "Comp B", Date = DateTime.UtcNow.AddDays(1), Status = Domain.Entities.MatchStatus.Replay }
        };
        
        _mockPlaylistRepository.Setup(repo => repo.GetMatchesByUserIdAsync(userId)).ReturnsAsync(matches);

        // Act
        var result = await _playlistService.GetPlaylistByUserIdAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(matches.Count, result.Matches.Count);
        Assert.Equal(matches[0].Id, result.Matches[0].Id);
        Assert.Equal(matches[1].Id, result.Matches[1].Id);
        _mockPlaylistRepository.Verify(repo => repo.GetMatchesByUserIdAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetPlaylistByUserIdAsync_ShouldReturnEmptyPlaylistDto_WhenUserHasNoMatches()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockPlaylistRepository.Setup(repo => repo.GetMatchesByUserIdAsync(userId)).ReturnsAsync(new List<DomainMatch>()); // Use alias

        // Act
        var result = await _playlistService.GetPlaylistByUserIdAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result.Matches);
        _mockPlaylistRepository.Verify(repo => repo.GetMatchesByUserIdAsync(userId), Times.Once);
    }

    [Fact]
    public async Task AddMatchToPlaylistAsync_ShouldReturnFailure_WhenMatchNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync((DomainMatch?)null); // Use alias

        // Act
        var result = await _playlistService.AddMatchToPlaylistAsync(userId, matchId);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Match not found.", result.Message);
        Assert.Null(result.Playlist);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.FindByKeysAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task AddMatchToPlaylistAsync_ShouldReturnSuccessAndExistingPlaylist_WhenMatchAlreadyInPlaylist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var match = new DomainMatch { Id = matchId, Title = "Existing Match" }; // Use alias
        var existingEntry = new Playlist { UserId = userId, MatchId = matchId };
        var currentMatches = new List<DomainMatch> { match }; // Use alias

        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync(match);
        _mockPlaylistRepository.Setup(repo => repo.FindByKeysAsync(userId, matchId)).ReturnsAsync(existingEntry);
        _mockPlaylistRepository.Setup(repo => repo.GetMatchesByUserIdAsync(userId)).ReturnsAsync(currentMatches);

        // Act
        var result = await _playlistService.AddMatchToPlaylistAsync(userId, matchId);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Match already in playlist.", result.Message);
        Assert.NotNull(result.Playlist);
        Assert.Single(result.Playlist.Matches);
        Assert.Equal(matchId, result.Playlist.Matches[0].Id);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.FindByKeysAsync(userId, matchId), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.GetMatchesByUserIdAsync(userId), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task AddMatchToPlaylistAsync_ShouldAddEntryAndReturnUpdatedPlaylist_WhenMatchExistsAndNotInPlaylist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var match = new DomainMatch { Id = matchId, Title = "New Match" }; // Use alias
        var updatedMatches = new List<DomainMatch> { match }; // Use alias

        _mockMatchRepository.Setup(repo => repo.GetByIdAsync(matchId)).ReturnsAsync(match);
        _mockPlaylistRepository.Setup(repo => repo.FindByKeysAsync(userId, matchId)).ReturnsAsync((Playlist?)null);
        _mockPlaylistRepository.Setup(repo => repo.AddAsync(It.IsAny<Playlist>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1); // Simulate successful save
        _mockPlaylistRepository.Setup(repo => repo.GetMatchesByUserIdAsync(userId)).ReturnsAsync(updatedMatches);

        // Act
        var result = await _playlistService.AddMatchToPlaylistAsync(userId, matchId);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Match added to playlist successfully.", result.Message);
        Assert.NotNull(result.Playlist);
        Assert.Single(result.Playlist.Matches);
        Assert.Equal(matchId, result.Playlist.Matches[0].Id);
        _mockMatchRepository.Verify(repo => repo.GetByIdAsync(matchId), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.FindByKeysAsync(userId, matchId), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.AddAsync(It.Is<Playlist>(p => p.UserId == userId && p.MatchId == matchId)), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.GetMatchesByUserIdAsync(userId), Times.Once);
    }

    [Fact]
    public async Task RemoveMatchFromPlaylistAsync_ShouldReturnFailure_WhenMatchNotInPlaylist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        _mockPlaylistRepository.Setup(repo => repo.FindByKeysAsync(userId, matchId)).ReturnsAsync((Playlist?)null);

        // Act
        var result = await _playlistService.RemoveMatchFromPlaylistAsync(userId, matchId);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Match not found in the playlist.", result.Message);
        Assert.Null(result.Playlist);
        _mockPlaylistRepository.Verify(repo => repo.FindByKeysAsync(userId, matchId), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task RemoveMatchFromPlaylistAsync_ShouldRemoveEntryAndReturnUpdatedPlaylist_WhenMatchInPlaylist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var playlistEntry = new Playlist { UserId = userId, MatchId = matchId };
        var updatedMatches = new List<DomainMatch>(); // Empty list after removal, use alias

        _mockPlaylistRepository.Setup(repo => repo.FindByKeysAsync(userId, matchId)).ReturnsAsync(playlistEntry);
        _mockPlaylistRepository.Setup(repo => repo.Remove(playlistEntry));
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1); // Simulate successful save
        _mockPlaylistRepository.Setup(repo => repo.GetMatchesByUserIdAsync(userId)).ReturnsAsync(updatedMatches);

        // Act
        var result = await _playlistService.RemoveMatchFromPlaylistAsync(userId, matchId);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Match removed from playlist successfully.", result.Message);
        Assert.NotNull(result.Playlist);
        Assert.Empty(result.Playlist.Matches);
        _mockPlaylistRepository.Verify(repo => repo.FindByKeysAsync(userId, matchId), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.Remove(playlistEntry), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
        _mockPlaylistRepository.Verify(repo => repo.GetMatchesByUserIdAsync(userId), Times.Once);
    }
}

