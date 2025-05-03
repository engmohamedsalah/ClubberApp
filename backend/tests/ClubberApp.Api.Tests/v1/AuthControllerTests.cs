using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using ClubberApp.Application.DTOs;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace ClubberApp.Api.Tests.v1;

public class AuthControllerTests : V1ControllerTestBase
{
    public AuthControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task Register_ShouldReturnSuccess_WhenDataIsValid()
    {
        // Arrange
        var username = $"integration_test_user_{Guid.NewGuid().ToString("N").Substring(0, 10)}";
        var registerDto = new RegisterDto { Username = username, Password = "password123" };
        
        // Act
        var response = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Register failed: {errorContent}");
        }
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        
        // Assert
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.Equal("Registration successful.", result.Message);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUsernameExists()
    {
        // Arrange
        var username = "existing_user_for_test";
        var registerDto1 = new RegisterDto { Username = username, Password = "password123" };
        var registerDto2 = new RegisterDto { Username = username, Password = "anotherpassword" };
        
        // Act
        var response1 = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto1);
        response1.EnsureSuccessStatusCode();
        var response2 = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto2);
        var problem = await response2.Content.ReadFromJsonAsync<ProblemDetails>();
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);
        Assert.Equal("Registration failed", problem?.Title);
        Assert.Equal(400, problem?.Status);
        Assert.Contains("already exists", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenModelIsInvalid()
    {
        // Arrange
        var registerDto = new RegisterDto { Username = "", Password = "123" };
        
        // Act
        var response = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        // Optionally parse ProblemDetails if model validation returns it
    }

    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var username = "login_test_user";
        var password = "password456";
        var registerDto = new RegisterDto { Username = username, Password = password };
        var loginDto = new LoginDto { Username = username, Password = password };
        
        // Act
        var registerResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        if (!registerResponse.IsSuccessStatusCode)
        {
            var problem = await registerResponse.Content.ReadFromJsonAsync<ProblemDetails>();
            throw new Exception($"Register failed: {problem?.Title} - {problem?.Detail}");
        }
        var loginResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/login", loginDto);
        if (!loginResponse.IsSuccessStatusCode)
        {
            var problem = await loginResponse.Content.ReadFromJsonAsync<ProblemDetails>();
            throw new Exception($"Login failed: {problem?.Title} - {problem?.Detail}");
        }
        var result = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        
        // Assert
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.Equal("Login successful.", result.Message);
        Assert.NotNull(result.Token);
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsInvalid()
    {
        // Arrange
        var username = "login_fail_user";
        var password = "correct_password";
        var registerDto = new RegisterDto { Username = username, Password = password };
        var loginDto = new LoginDto { Username = username, Password = "wrong_password" };
        
        // Act
        var registerResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        registerResponse.EnsureSuccessStatusCode();
        var loginResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/login", loginDto);
        var problem = await loginResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        
        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, loginResponse.StatusCode);
        Assert.Equal("Login failed", problem?.Title);
        Assert.Equal(401, problem?.Status);
        Assert.Contains("invalid username or password", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenUserDoesNotExist()
    {
        // Arrange
        var loginDto = new LoginDto { Username = "non_existent_user", Password = "password" };
        
        // Act
        var loginResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/login", loginDto);
        var problem = await loginResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        
        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, loginResponse.StatusCode);
        Assert.Equal("Login failed", problem?.Title);
        Assert.Equal(401, problem?.Status);
        Assert.Contains("invalid username or password", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }
}

