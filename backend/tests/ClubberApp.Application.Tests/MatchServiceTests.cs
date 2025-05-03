using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Enums;
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
            new DomainMatch { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = Domain.Entities.MatchStatus.Replay, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" },
            new DomainMatch { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = Domain.Entities.MatchStatus.Live, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" }
        };
        var matchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = Enums.MatchStatus.Completed, Availability = Enums.MatchAvailability.Available, StreamURL = "" },
            new MatchDto { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = Enums.MatchStatus.InProgress, Availability = Enums.MatchAvailability.Available, StreamURL = "" }
        };

        _mockMatchRepository.Setup(repo => repo.SearchMatchesAsync(It.IsAny<MatchSearchParameters>()))
                          .ReturnsAsync(new SearchResult<DomainMatch>(matches, matches.Count, 1, int.MaxValue));
        _mockMapper.Setup(m => m.Map<List<MatchDto>>(matches)).Returns(matchDtos.ToList());
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()))
            .Returns<DomainMatch>(m => $"https://stream.example.com/{m.Status.ToString().ToLower()}/{m.Id}");

        // Act
        var result = await _matchService.GetAllMatchesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockMatchRepository.Verify(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => 
            p.Page == 1 && 
            p.PageSize == int.MaxValue && 
            p.Status == null && 
            p.CompetitionName == null)), Times.Once);
        _mockMapper.Verify(m => m.Map<List<MatchDto>>(matches), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Exactly(2));
    }

    [Fact]
    public async Task GetMatchesByStatusAsync_ShouldReturnCorrectMatches()
    {
        // Arrange
        var matchId1 = Guid.NewGuid();
        var matchId2 = Guid.NewGuid();
        var matchId3 = Guid.NewGuid();
        var domainStatusToFetch = Domain.Entities.MatchStatus.Live;
        var dtoStatusToFetch = Enums.MatchStatus.InProgress;

        var allMatches = new List<DomainMatch>
        {
            new DomainMatch { Id = matchId1, Title = "Match 1", Competition = "Comp A", Status = Domain.Entities.MatchStatus.Replay, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" },
            new DomainMatch { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = Domain.Entities.MatchStatus.Live, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" },
            new DomainMatch { Id = matchId3, Title = "Match 3", Competition = "Comp C", Status = Domain.Entities.MatchStatus.Live, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" }
        };
        var liveMatches = allMatches.Where(m => m.Status == domainStatusToFetch).ToList();
        var liveMatchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId2, Title = "Match 2", Competition = "Comp B", Status = Enums.MatchStatus.InProgress, Availability = Enums.MatchAvailability.Available, StreamURL = "" },
            new MatchDto { Id = matchId3, Title = "Match 3", Competition = "Comp C", Status = Enums.MatchStatus.InProgress, Availability = Enums.MatchAvailability.Available, StreamURL = "" }
        };

        // Set up mapper to convert between domain and DTO enums
        _mockMapper.Setup(m => m.Map<Domain.Entities.MatchStatus>(dtoStatusToFetch)).Returns(domainStatusToFetch);

        // Mock the repository's SearchMatchesAsync method
        _mockMatchRepository.Setup(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => p.Status == domainStatusToFetch)))
                          .ReturnsAsync(new SearchResult<DomainMatch>(liveMatches, liveMatches.Count, 1, int.MaxValue));
        
        _mockMapper.Setup(m => m.Map<List<MatchDto>>(liveMatches)).Returns(liveMatchDtos.ToList());
        
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()))
            .Returns<DomainMatch>(m => $"https://stream.example.com/{m.Status.ToString().ToLower()}/{m.Id}");

        // Act
        var result = await _matchService.GetMatchesByStatusAsync(dtoStatusToFetch);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockMatchRepository.Verify(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => 
            p.Status == domainStatusToFetch && 
            p.Page == 1 && 
            p.PageSize == int.MaxValue)), Times.Once);
        _mockMapper.Verify(m => m.Map<List<MatchDto>>(liveMatches), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Exactly(2));
    }

    [Fact]
    public async Task GetMatchByIdAsync_ShouldReturnMatch_WhenMatchExists()
    {
        // Arrange
        var matchId = Guid.NewGuid(); // Use Guid
        var match = new DomainMatch { Id = matchId, Title = "Match 1", Competition = "Comp A", Status = Domain.Entities.MatchStatus.Replay, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" }; // Use alias and correct properties
        var matchDto = new MatchDto { Id = matchId, Title = "Match 1", Competition = "Comp A", Status = Enums.MatchStatus.Completed, Availability = Enums.MatchAvailability.Available, StreamURL = "" };
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
        var createDto = new MatchDto 
        { 
            Title = "New Match", 
            Competition = "Football", 
            Date = DateTime.Now.AddDays(1), 
            Status = Enums.MatchStatus.InProgress,
            Availability = Enums.MatchAvailability.Available,
            StreamURL = "" 
        };
        var match = new DomainMatch 
        { 
            Id = matchId, 
            Title = "New Match", 
            Competition = "Football", 
            Status = Domain.Entities.MatchStatus.Live,
            Availability = Domain.Entities.MatchAvailability.Available,
            StreamURL = "" 
        };
        var generatedStreamUrl = $"https://stream.example.com/live/{matchId}";

        _mockMapper.Setup(m => m.Map<DomainMatch>(createDto)).Returns(match);
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
        var updateDto = new MatchDto 
        { 
            Title = "Updated Match", 
            Competition = "Basketball", 
            Date = DateTime.Now.AddDays(2), 
            Status = Enums.MatchStatus.Completed,
            Availability = Enums.MatchAvailability.Available,
            StreamURL = "" 
        };
        var existingMatch = new DomainMatch 
        { 
            Id = matchId, 
            Title = "Old Match", 
            Competition = "Football", 
            Status = Domain.Entities.MatchStatus.Live,
            Availability = Domain.Entities.MatchAvailability.Available,
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

    [Fact]
    public async Task SearchMatchesAsync_ShouldReturnMatchesFilteredBySearchTerm()
    {
        // Arrange
        var matchId1 = Guid.NewGuid();
        var matchId2 = Guid.NewGuid();
        var matchId3 = Guid.NewGuid();
        var searchTerm = "Football";
        var domainStatusToFetch = (Domain.Entities.MatchStatus?)null;
        var dtoStatusToFetch = (Enums.MatchStatus?)null;

        var filteredMatches = new List<DomainMatch>
        {
            new DomainMatch { Id = matchId1, Title = "Football Match 1", Competition = "Football League", Status = Domain.Entities.MatchStatus.Replay, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" },
            new DomainMatch { Id = matchId2, Title = "Football Match 2", Competition = "Football Cup", Status = Domain.Entities.MatchStatus.Live, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" }
        };
        
        var filteredMatchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId1, Title = "Football Match 1", Competition = "Football League", Status = Enums.MatchStatus.Completed, Availability = Enums.MatchAvailability.Available, StreamURL = "" },
            new MatchDto { Id = matchId2, Title = "Football Match 2", Competition = "Football Cup", Status = Enums.MatchStatus.InProgress, Availability = Enums.MatchAvailability.Available, StreamURL = "" }
        };

        // Mock the repository's SearchMatchesAsync method
        _mockMatchRepository.Setup(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => 
            p.CompetitionName == searchTerm && 
            p.Status == null)))
                      .ReturnsAsync(new SearchResult<DomainMatch>(filteredMatches, filteredMatches.Count, 1, int.MaxValue));
        
        _mockMapper.Setup(m => m.Map<List<MatchDto>>(filteredMatches)).Returns(filteredMatchDtos.ToList());
        
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()))
            .Returns<DomainMatch>(m => $"https://stream.example.com/{m.Status.ToString().ToLower()}/{m.Id}");

        // Act
        var result = await _matchService.SearchMatchesAsync(searchTerm, dtoStatusToFetch);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockMatchRepository.Verify(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => 
            p.CompetitionName == searchTerm && 
            p.Status == null && 
            p.Page == 1 && 
            p.PageSize == int.MaxValue)), Times.Once);
        _mockMapper.Verify(m => m.Map<List<MatchDto>>(filteredMatches), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Exactly(2));
    }

    [Fact]
    public async Task SearchMatchesPaginatedAsync_ShouldReturnPaginatedResultsWithTotalCount()
    {
        // Arrange
        var matchId1 = Guid.NewGuid();
        var matchId2 = Guid.NewGuid();
        var matchId3 = Guid.NewGuid();
        var searchTerm = "Football";
        var domainStatusToFetch = (Domain.Entities.MatchStatus?)null;
        var dtoStatusToFetch = (Enums.MatchStatus?)null;
        var page = 1;
        var pageSize = 2;
        var totalCount = 3;

        var pagedMatches = new List<DomainMatch>
        {
            new DomainMatch { Id = matchId1, Title = "Football Match 1", Competition = "Football League", Status = Domain.Entities.MatchStatus.Replay, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" },
            new DomainMatch { Id = matchId2, Title = "Football Match 2", Competition = "Football Cup", Status = Domain.Entities.MatchStatus.Live, Availability = Domain.Entities.MatchAvailability.Available, StreamURL = "" }
        };
        
        var pagedMatchDtos = new List<MatchDto>
        {
            new MatchDto { Id = matchId1, Title = "Football Match 1", Competition = "Football League", Status = Enums.MatchStatus.Completed, Availability = Enums.MatchAvailability.Available, StreamURL = "" },
            new MatchDto { Id = matchId2, Title = "Football Match 2", Competition = "Football Cup", Status = Enums.MatchStatus.InProgress, Availability = Enums.MatchAvailability.Available, StreamURL = "" }
        };

        // Mock the repository's SearchMatchesAsync method
        _mockMatchRepository.Setup(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => 
            p.CompetitionName == searchTerm && 
            p.Status == null &&
            p.Page == page &&
            p.PageSize == pageSize)))
                      .ReturnsAsync(new SearchResult<DomainMatch>(pagedMatches, totalCount, page, pageSize));
        
        _mockMapper.Setup(m => m.Map<List<MatchDto>>(pagedMatches)).Returns(pagedMatchDtos.ToList());
        
        _mockStreamUrlService.Setup(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()))
            .Returns<DomainMatch>(m => $"https://stream.example.com/{m.Status.ToString().ToLower()}/{m.Id}");

        // Act
        var result = await _matchService.SearchMatchesPaginatedAsync(searchTerm, dtoStatusToFetch, page, pageSize);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(page, result.Page);
        Assert.Equal(pageSize, result.PageSize);
        Assert.Equal(totalCount, result.TotalCount);
        Assert.Equal(2, result.Data.Count());
        _mockMatchRepository.Verify(repo => repo.SearchMatchesAsync(It.Is<MatchSearchParameters>(p => 
            p.CompetitionName == searchTerm && 
            p.Status == null &&
            p.Page == page &&
            p.PageSize == pageSize)), Times.Once);
        _mockMapper.Verify(m => m.Map<List<MatchDto>>(pagedMatches), Times.Once);
        _mockStreamUrlService.Verify(s => s.GenerateStreamUrl(It.IsAny<DomainMatch>()), Times.Exactly(2));
    }
}

