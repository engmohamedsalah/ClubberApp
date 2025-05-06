using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Services;

public class PlaylistService : IPlaylistService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PlaylistService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PlaylistDto> GetPlaylistByUserIdAsync(Guid userId)
    {
        var matches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
        var matchDtos = _mapper.Map<IEnumerable<MatchDto>>(matches);
        // The PlaylistDto now just holds the list of matches for the user
        return new PlaylistDto { Matches = matchDtos.ToList() };
    }

    public async Task<PlaylistActionResultDto> AddMatchToPlaylistAsync(Guid userId, Guid matchId)
    {
        // Check if the match exists
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(matchId);
        if (match == null)
        {
            return new PlaylistActionResultDto { Succeeded = false, Message = "Match not found." };
        }

        // Check if the entry already exists in the playlist
        var existingEntry = await _unitOfWork.PlaylistRepository.FindByKeysAsync(userId, matchId);
        if (existingEntry != null)
        {
            // Match already in playlist, return current playlist
            var currentMatches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
            return new PlaylistActionResultDto
            {
                Succeeded = true,
                Message = "Match already in playlist.",
                Playlist = new PlaylistDto { Matches = _mapper.Map<List<MatchDto>>(currentMatches) }
            };
        }

        // Add the new entry
        var playlistEntry = new Playlist
        {
            UserId = userId,
            MatchId = matchId,
            DateAdded = DateTime.UtcNow
        };

        await _unitOfWork.PlaylistRepository.AddAsync(playlistEntry);
        
        try 
        {
            var numberOfChanges = await _unitOfWork.SaveChangesAsync(); // Get the number of changes

            if (numberOfChanges < 1) // Check if any rows were actually affected
            {
                // Log this critical failure on the backend if a logger is available
                // _logger.LogError($"Failed to persist playlist entry to database for user {userId} and match {matchId}. SaveChangesAsync returned {numberOfChanges}.");
                return new PlaylistActionResultDto { 
                    Succeeded = false, 
                    Message = "Failed to save update to the playlist in the database.", // More accurate message
                    Playlist = null // Or potentially fetch and return the current unchanged playlist
                };
            }

            // If changes were made, then fetch and return the updated playlist
            var updatedMatches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
            return new PlaylistActionResultDto
            {
                Succeeded = true,
                Message = "Match added to playlist successfully.",
                Playlist = new PlaylistDto { Matches = _mapper.Map<List<MatchDto>>(updatedMatches) }
            };
        } 
        catch (Exception ex) 
        {
            // Log the exception if a logger is available
            // _logger.LogError(ex, $"Exception occurred during SaveChangesAsync for playlist entry for user {userId} and match {matchId}.");
            return new PlaylistActionResultDto {
                Succeeded = false,
                Message = $"An error occurred while saving the playlist: {ex.Message}",
                Playlist = null
            };
        }
    }

    public async Task<PlaylistActionResultDto> RemoveMatchFromPlaylistAsync(Guid userId, Guid matchId)
    {
        // Find the playlist entry
        var playlistEntry = await _unitOfWork.PlaylistRepository.FindByKeysAsync(userId, matchId);
        if (playlistEntry == null)
        {
            return new PlaylistActionResultDto { Succeeded = false, Message = "Match not found in the playlist." };
        }

        // Remove the entry
        _unitOfWork.PlaylistRepository.Remove(playlistEntry);
        await _unitOfWork.SaveChangesAsync();

        // Return the updated playlist
        var updatedMatches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
        return new PlaylistActionResultDto
        {
            Succeeded = true,
            Message = "Match removed from playlist successfully.",
            Playlist = new PlaylistDto { Matches = _mapper.Map<List<MatchDto>>(updatedMatches) }
        };
    }

    public async Task<PaginatedResult<MatchDto>> GetPlaylistPaginatedByUserIdAsync(Guid userId, int page, int pageSize)
    {
        var matches = await _unitOfWork.PlaylistRepository.GetMatchesByUserIdAsync(userId);
        var matchDtos = _mapper.Map<List<MatchDto>>(matches);
        var totalCount = matchDtos.Count;
        var paged = matchDtos.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PaginatedResult<MatchDto>(paged, page, pageSize, totalCount);
    }
}

