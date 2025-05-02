using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using ClubberApp.Application.DTOs;
using System.Text.Json;

namespace ClubberApp.Api.Tests.v1;

public class AuthControllerTests : V1ControllerTestBase
{
    public AuthControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    public class ProblemDetails
    {
        public string? Type { get; set; }
        public string? Title { get; set; }
        public int? Status { get; set; }
        public string? Detail { get; set; }
        public string? Instance { get; set; }
    }

    [Fact]
    public async Task Register_ShouldReturnSuccess_WhenDataIsValid()
    {
        var username = $"integration_test_user_{Guid.NewGuid().ToString("N").Substring(0, 10)}";
        var registerDto = new RegisterDto { Username = username, Password = "password123" };
        var response = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Register failed: {errorContent}");
        }
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.Equal("Registration successful.", result.Message);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUsernameExists()
    {
        var username = "existing_user_for_test";
        var registerDto1 = new RegisterDto { Username = username, Password = "password123" };
        var registerDto2 = new RegisterDto { Username = username, Password = "anotherpassword" };
        var response1 = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto1);
        response1.EnsureSuccessStatusCode();
        var response2 = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto2);
        Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);
        var problem = await response2.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Registration failed", problem?.Title);
        Assert.Equal(400, problem?.Status);
        Assert.Contains("already exists", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenModelIsInvalid()
    {
        var registerDto = new RegisterDto { Username = "", Password = "123" };
        var response = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        // Optionally parse ProblemDetails if model validation returns it
    }

    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        var username = "login_test_user";
        var password = "password456";
        var registerDto = new RegisterDto { Username = username, Password = password };
        var loginDto = new LoginDto { Username = username, Password = password };
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
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.Equal("Login successful.", result.Message);
        Assert.NotNull(result.Token);
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsInvalid()
    {
        var username = "login_fail_user";
        var password = "correct_password";
        var registerDto = new RegisterDto { Username = username, Password = password };
        var loginDto = new LoginDto { Username = username, Password = "wrong_password" };
        var registerResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/register", registerDto);
        registerResponse.EnsureSuccessStatusCode();
        var loginResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/login", loginDto);
        Assert.Equal(HttpStatusCode.Unauthorized, loginResponse.StatusCode);
        var problem = await loginResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Login failed", problem?.Title);
        Assert.Equal(401, problem?.Status);
        Assert.Contains("invalid username or password", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenUserDoesNotExist()
    {
        var loginDto = new LoginDto { Username = "non_existent_user", Password = "password" };
        var loginResponse = await _client.PostAsJsonAsync($"{ApiBase}/auth/login", loginDto);
        Assert.Equal(HttpStatusCode.Unauthorized, loginResponse.StatusCode);
        var problem = await loginResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Login failed", problem?.Title);
        Assert.Equal(401, problem?.Status);
        Assert.Contains("invalid username or password", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }
}

