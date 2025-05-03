namespace ClubberApp.Application.DTOs;

public class PlaylistActionResultDto
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public PlaylistDto? Playlist { get; set; } // The updated playlist content
} 