using ClubberApp.Application.DTOs;
using ClubberApp.Application.Enums;
using ClubberApp.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Threading;
using ClubberApp.Api.Sse;

namespace ClubberApp.Api.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMatchService _matchService;

    public MatchesController(IMatchService matchService)
    {
        _matchService = matchService;
    }

    /// <summary>
    /// Gets a list of matches, optionally filtered by competition and status.
    /// </summary>
    /// <param name="competition">Competition name to filter by.</param>
    /// <param name="status">Match status to filter by. Valid values are: Upcoming, Live, OnDemand, Canceled</param>
    /// <param name="page">Page number for pagination.</param>
    /// <param name="pageSize">Page size for pagination.</param>
    /// <param name="sortBy">Field to sort by (title, competition, date, status).</param>
    /// <param name="sortDescending">Whether to sort in descending order.</param>
    /// <returns>List of matches.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<MatchDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMatches(
        [FromQuery] string? competition, 
        [FromQuery] MatchStatus? status, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = "date",
        [FromQuery] bool sortDescending = false)
    {
        var matchStatus = status;
        var paginated = await _matchService.SearchMatchesPaginatedAsync(competition, matchStatus, page, pageSize, sortBy, sortDescending);
        return Ok(paginated);
    }

    /// <summary>
    /// Gets a match by its ID.
    /// </summary>
    /// <param name="id">Match ID.</param>
    /// <returns>The match if found, otherwise 404.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMatch(Guid id)
    {
        var match = await _matchService.GetMatchByIdAsync(id);
        if (match == null)
        {
            return Problem(
                detail: $"Match with id {id} not found.",
                statusCode: StatusCodes.Status404NotFound,
                title: "Match not found"
            );
        }
        return Ok(match);
    }

    /// <summary>
    /// Gets all live matches.
    /// </summary>
    [HttpGet("live")]
    public async Task<IActionResult> GetLiveMatches([FromQuery] string? sortBy = "date", [FromQuery] bool sortDescending = false)
    {
        var paginated = await _matchService.SearchMatchesPaginatedAsync(null, MatchStatus.Live, 1, 100, sortBy, sortDescending);
        return Ok(paginated.Data); // Return just the list for compatibility with tests
    }

    // SSE endpoint for real-time match updates
    [AllowAnonymous]
    [HttpGet("stream")]
    public async Task StreamMatches(CancellationToken cancellationToken)
    {
        Response.Headers.Add("Content-Type", "text/event-stream");
        await SseMatchNotifier.Instance.RegisterClientAsync(Response, cancellationToken);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMatch([FromBody] MatchDto matchDto)
    {
        var created = await _matchService.CreateMatchAsync(matchDto);
        await SseMatchNotifier.Instance.BroadcastMatchEventAsync(new { type = "add", match = created });
        return Ok(created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateMatch(Guid id, [FromBody] MatchDto matchDto)
    {
        var success = await _matchService.UpdateMatchAsync(id, matchDto);
        if (!success) return NotFound();
        await SseMatchNotifier.Instance.BroadcastMatchEventAsync(new { type = "update", match = matchDto });
        return Ok(matchDto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMatch(Guid id)
    {
        var success = await _matchService.DeleteMatchAsync(id);
        if (!success) return NotFound();
        await SseMatchNotifier.Instance.BroadcastMatchEventAsync(new { type = "delete", matchId = id });
        return NoContent();
    }

    // Add other endpoints if needed (e.g., POST for creating matches - not required by spec)
}

