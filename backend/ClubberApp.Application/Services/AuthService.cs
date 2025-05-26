using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ClubberApp.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if username already exists
        var existingUser = await _unitOfWork.UserRepository.GetUserByUsernameAsync(registerDto.Username);
        if (existingUser != null)
        {
            return new AuthResponseDto { Succeeded = false, Message = "Username already exists." };
        }

        // Map DTO to User entity
        var user = _mapper.Map<User>(registerDto);

        // Hash password (implement secure hashing)
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Add user and save changes
        await _unitOfWork.UserRepository.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Map User to UserDto for response
        var userDto = _mapper.Map<UserDto>(user);

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return new AuthResponseDto { Succeeded = true, Message = "Registration successful.", Token = token, User = userDto };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        // Find user by username
        var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(loginDto.Username);

        // Validate user and password
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return new AuthResponseDto { Succeeded = false, Message = "Invalid username or password." };
        }

        // Map User to UserDto for response
        var userDto = _mapper.Map<UserDto>(user);

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return new AuthResponseDto { Succeeded = true, Message = "Login successful.", Token = token, User = userDto };
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> UpdateUserProfileAsync(Guid userId, UserProfileUpdateDto updateDto)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null) return null;
        user.Username = updateDto.Username;
        user.Email = updateDto.Email;
        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null) return false;
        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash)) return false;
        if (dto.NewPassword != dto.ConfirmPassword) return false;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured"));
        var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
        var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

        var durationInHours = int.TryParse(jwtSettings["DurationInHours"], out int hours) ? hours : 1;



        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
                // Add other claims as needed (e.g., roles)
            }),

            Expires = DateTime.UtcNow.AddHours(durationInHours), // Use the configured duration


            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

