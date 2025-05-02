using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace ClubberApp.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="registerDto">User registration data.</param>
    /// <returns>Result of registration.</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        if (!result.Succeeded)
        {
            return Problem(
                detail: result.Message ?? "Registration failed.",
                statusCode: StatusCodes.Status400BadRequest,
                title: "Registration failed"
            );
        }
        return Ok(result);
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    /// <param name="loginDto">User login data.</param>
    /// <returns>JWT token and user info.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        if (!result.Succeeded || result.Token == null)
        {
            return Problem(
                detail: result.Message ?? "Invalid username or password.",
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Login failed"
            );
        }
        return Ok(result);
    }
}

