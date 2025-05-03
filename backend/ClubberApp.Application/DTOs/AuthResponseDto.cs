namespace ClubberApp.Application.DTOs;

public class AuthResponseDto
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; } // Nullable if login/register fails
    public UserDto? User { get; set; } // Nullable if login/register fails
} 