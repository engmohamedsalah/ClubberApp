using ClubberApp.Application.DTOs;

namespace ClubberApp.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    Task<UserDto?> UpdateUserProfileAsync(Guid userId, UserProfileUpdateDto updateDto);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}

