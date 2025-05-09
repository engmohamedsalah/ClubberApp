using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities;
using System.Linq;

namespace ClubberApp.Application.Services;

public class PlaylistService : IPlaylistService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IStreamUrlService _streamUrlService;

    public PlaylistService(IUnitOfWork unitOfWork, IMapper mapper, IStreamUrlService streamUrlService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _streamUrlService = streamUrlService;
    }

    public async Task<PlaylistDto> GetPlaylistByUserIdAsync(Guid userId)
    {
        var matches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
        var matchDtos = _mapper.Map<List<MatchDto>>(matches);
        EnrichStreamUrls(matchDtos, matches);
        return new PlaylistDto { Matches = matchDtos };
    }

    public async Task<PlaylistActionResultDto> AddMatchToPlaylistAsync(Guid userId, Guid matchId)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(matchId);
        if (match == null)
        {
            return new PlaylistActionResultDto { Succeeded = false, Message = "Match not found." };
        }

        var existingEntry = await _unitOfWork.PlaylistRepository.FindByKeysAsync(userId, matchId);
        if (existingEntry != null)
        {
            var currentMatches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
            var matchDtos = _mapper.Map<List<MatchDto>>(currentMatches);
            EnrichStreamUrls(matchDtos, currentMatches);
            return new PlaylistActionResultDto
            {
                Succeeded = true,
                Message = "Match already in playlist.",
                Playlist = new PlaylistDto { Matches = matchDtos }
            };
        }

        var playlistEntry = new Playlist
        {
            UserId = userId,
            MatchId = matchId,
            DateAdded = DateTime.UtcNow
        };

        await _unitOfWork.PlaylistRepository.AddAsync(playlistEntry);
        try
        {
            var numberOfChanges = await _unitOfWork.SaveChangesAsync();
            if (numberOfChanges < 1)
            {
                return new PlaylistActionResultDto {
                    Succeeded = false,
                    Message = "Failed to save update to the playlist in the database.",
                    Playlist = null
                };
            }
            var updatedMatches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
            var matchDtos = _mapper.Map<List<MatchDto>>(updatedMatches);
            EnrichStreamUrls(matchDtos, updatedMatches);
            return new PlaylistActionResultDto
            {
                Succeeded = true,
                Message = "Match added to playlist successfully.",
                Playlist = new PlaylistDto { Matches = matchDtos }
            };
        }
        catch (Exception ex)
        {
            return new PlaylistActionResultDto {
                Succeeded = false,
                Message = $"An error occurred while saving the playlist: {ex.Message}",
                Playlist = null
            };
        }
    }

    public async Task<PlaylistActionResultDto> RemoveMatchFromPlaylistAsync(Guid userId, Guid matchId)
    {
        var playlistEntry = await _unitOfWork.PlaylistRepository.FindByKeysAsync(userId, matchId);
        if (playlistEntry == null)
        {
            return new PlaylistActionResultDto { Succeeded = false, Message = "Match not found in the playlist." };
        }

        _unitOfWork.PlaylistRepository.Remove(playlistEntry);
        await _unitOfWork.SaveChangesAsync();

        var updatedMatches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
        var matchDtos = _mapper.Map<List<MatchDto>>(updatedMatches);
        EnrichStreamUrls(matchDtos, updatedMatches);
        return new PlaylistActionResultDto
        {
            Succeeded = true,
            Message = "Match removed from playlist successfully.",
            Playlist = new PlaylistDto { Matches = matchDtos }
        };
    }

    public async Task<PaginatedResult<MatchDto>> GetPlaylistPaginatedByUserIdAsync(Guid userId, int page, int pageSize)
    {
        var matches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
        var matchDtos = _mapper.Map<List<MatchDto>>(matches);
        EnrichStreamUrls(matchDtos, matches);
        var totalCount = matchDtos.Count;
        var paged = matchDtos.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PaginatedResult<MatchDto>(paged, page, pageSize, totalCount);
    }

    private void EnrichStreamUrls(List<MatchDto> matchDtos, IEnumerable<Match> matches)
    {
        foreach (var matchDto in matchDtos)
        {
            var match = matches.FirstOrDefault(m => m.Id == matchDto.Id);
            if (match != null && string.IsNullOrEmpty(matchDto.StreamURL))
            {
                matchDto.StreamURL = _streamUrlService.GenerateStreamUrl(match);
            }
        }
    }
}

