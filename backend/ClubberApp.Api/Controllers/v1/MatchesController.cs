using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities; // For MatchStatus enum
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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
    /// <param name="status">Match status to filter by.</param>
    /// <param name="page">Page number for pagination.</param>
    /// <param name="pageSize">Page size for pagination.</param>
    /// <returns>List of matches.</returns>
    [HttpGet]
    public async Task<IActionResult> GetMatches([FromQuery] string? competition, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var matchStatus = (MatchStatus?)null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<MatchStatus>(status, true, out var parsedStatus))
        {
            matchStatus = parsedStatus;
        }
        var paginated = await _matchService.SearchMatchesPaginatedAsync(competition, matchStatus, page, pageSize);
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
    public async Task<IActionResult> GetLiveMatches()
    {
        var paginated = await _matchService.SearchMatchesPaginatedAsync(null, MatchStatus.Live, 1, 100);
        return Ok(paginated.Data); // Return just the list for compatibility with tests
    }

    // Add other endpoints if needed (e.g., POST for creating matches - not required by spec)
}

