using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ClubberApp.Api.Controllers.v1;

[Authorize] // Requires authentication for all actions in this controller
[ApiController]
[Route("api/v1/[controller]")]
public class PlaylistController : ControllerBase
{
    private readonly IPlaylistService _playlistService;

    public PlaylistController(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    // Helper to get UserId from claims
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            // This should ideally not happen if [Authorize] is working correctly
            // and the token contains the NameIdentifier claim.
            throw new InvalidOperationException("User ID not found in token claims.");
        }
        return userId;
    }

    /// <summary>
    /// Gets the current user's playlist.
    /// </summary>
    /// <returns>The user's playlist.</returns>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MatchDto>>> GetPlaylist([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetUserId();
            var paginated = await _playlistService.GetPlaylistPaginatedByUserIdAsync(userId, page, pageSize);
            return Ok(paginated);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status401Unauthorized, title: "Unauthorized");
        }
    }

    /// <summary>
    /// Adds a match to the current user's playlist.
    /// </summary>
    /// <param name="matchId">The match ID to add.</param>
    /// <returns>Result of the add operation.</returns>
    [HttpPost("{matchId:guid}")]
    public async Task<ActionResult<PlaylistActionResultDto>> AddMatchToPlaylist(Guid matchId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _playlistService.AddMatchToPlaylistAsync(userId, matchId);
            if (!result.Succeeded)
            {
                return Problem(
                    detail: result.Message,
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Add match to playlist failed"
                );
            }
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status401Unauthorized, title: "Unauthorized");
        }
    }

    /// <summary>
    /// Removes a match from the current user's playlist.
    /// </summary>
    /// <param name="matchId">The match ID to remove.</param>
    /// <returns>Result of the remove operation.</returns>
    [HttpDelete("{matchId:guid}")]
    public async Task<ActionResult<PlaylistActionResultDto>> RemoveMatchFromPlaylist(Guid matchId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _playlistService.RemoveMatchFromPlaylistAsync(userId, matchId);
            if (!result.Succeeded)
            {
                return Problem(
                    detail: result.Message,
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Remove match from playlist failed"
                );
            }
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status401Unauthorized, title: "Unauthorized");
        }
    }
}

