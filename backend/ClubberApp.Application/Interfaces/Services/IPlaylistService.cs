using ClubberApp.Application.DTOs;

namespace ClubberApp.Application.Interfaces.Services;

public interface IPlaylistService
{
    // Changed return type to PlaylistDto
    Task<PlaylistDto> GetPlaylistByUserIdAsync(Guid userId);

    // Changed return type to PlaylistActionResultDto
    Task<PlaylistActionResultDto> AddMatchToPlaylistAsync(Guid userId, Guid matchId);

    // Changed return type to PlaylistActionResultDto
    Task<PlaylistActionResultDto> RemoveMatchFromPlaylistAsync(Guid userId, Guid matchId);

    Task<PaginatedResult<MatchDto>> GetPlaylistPaginatedByUserIdAsync(Guid userId, int page, int pageSize);
}

