using ClubberApp.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace ClubberApp.Application.DTOs;

public class MatchDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Competition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty; // String representation for API
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    // Removed Email as it wasn't used in registration/login DTOs or entity
}

// Represents the user's playlist content
public class PlaylistDto
{
    public List<MatchDto> Matches { get; set; } = new List<MatchDto>();
}

// DTOs for API requests/responses
public class RegisterDto // Renamed from RegisterRequestDto for consistency
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto // Renamed from LoginRequestDto
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}

// Response for Auth operations
public class AuthResponseDto // Renamed from LoginResponseDto
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; } // Nullable if login/register fails
    public UserDto? User { get; set; } // Nullable if login/register fails
}

// Response for Playlist add/remove operations
public class PlaylistActionResultDto
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public PlaylistDto? Playlist { get; set; } // The updated playlist content
}

// Removed AddToPlaylistRequestDto as MatchId is passed via URL parameter




// DTO for creating a new match
public class MatchCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = "NotStarted"; // Default to NotStarted, use string for API flexibility
}

// DTO for updating an existing match
public class MatchUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty; // Use string for API flexibility
}

public class PaginatedResult<T>
{
    public IEnumerable<T> Data { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }

    public PaginatedResult(IEnumerable<T> data, int page, int pageSize, int totalCount)
    {
        Data = data;
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }
}

