namespace ClubberApp.Application.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    // Removed Email as it wasn't used in registration/login DTOs or entity
} 