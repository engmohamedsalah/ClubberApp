using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using ClubberApp.Application.DTOs;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace ClubberApp.Api.Tests.v1;

public class PlaylistControllerTests : V1ControllerTestBase
{
    public PlaylistControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    // Helper to get authenticated client and user ID
    private async Task<(HttpClient client, string userId)> GetAuthenticatedClientAndUserIdAsync()
    {
        var client = _factory.CreateClient();
        var username = $"playlist_test_{Guid.NewGuid().ToString("N").Substring(0, 20)}";
        var password = "password123";

        // Register
        var registerResponse = await client.PostAsJsonAsync($"{ApiBase}/auth/register", new RegisterDto { Username = username, Password = password });
        if (!registerResponse.IsSuccessStatusCode)
        {
            var errorContent = await registerResponse.Content.ReadAsStringAsync();
            throw new Exception($"Registration failed: {errorContent}");
        }

        // Login
        var loginResponse = await client.PostAsJsonAsync($"{ApiBase}/auth/login", new LoginDto { Username = username, Password = password });
        if (!loginResponse.IsSuccessStatusCode)
        {
            var errorContent = await loginResponse.Content.ReadAsStringAsync();
            throw new Exception($"Login failed: {errorContent}");
        }
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult?.Token);

        // Extract User ID from Token (robust, supports 'nameid', 'sub', and URI)
        string userId = "";
        if (!string.IsNullOrEmpty(loginResult?.Token))
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(loginResult.Token) as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
            var nameIdClaim = jsonToken?.Claims.FirstOrDefault(claim =>
                claim.Type == "nameid" ||
                claim.Type == "sub" ||
                claim.Type == System.Security.Claims.ClaimTypes.NameIdentifier ||
                claim.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            if (nameIdClaim == null)
            {
                throw new Exception($"JWT does not contain a recognized user ID claim. Token: {loginResult.Token}");
            }
            userId = nameIdClaim.Value;
        }

        return (client, userId);
    }

    private async Task<Guid> GetSeededMatchIdAsync()
    {
        var scopeFactory = _factory.Services.GetRequiredService<IServiceScopeFactory>();
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ClubberApp.Infrastructure.Persistence.ApplicationDbContext>();
        var match = db.Matches.FirstOrDefault();
        return match?.Id ?? Guid.Empty;
    }

    [Fact]
    public async Task GetPlaylist_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        // (No setup needed for unauthenticated request)
        
        // Act
        var response = await _client.GetAsync($"{ApiBase}/playlist");
        
        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetPlaylist_ShouldReturnPlaylist_WhenAuthenticated()
    {
        // Arrange
        var (client, _) = await GetAuthenticatedClientAndUserIdAsync();
        
        // Act
        var response = await client.GetAsync($"{ApiBase}/playlist");
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"GetPlaylist failed: {response.StatusCode} - {response.ReasonPhrase}");
        }
        var playlist = await response.Content.ReadFromJsonAsync<PlaylistDto>();
        
        // Assert
        Assert.NotNull(playlist);
        Assert.Empty(playlist.Matches);
    }

    [Fact]
    public async Task AddMatchToPlaylist_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        
        // Act
        var response = await _client.PostAsync($"{ApiBase}/playlist/{matchId}", null);
        
        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AddMatchToPlaylist_ShouldReturnBadRequest_WhenMatchNotFound()
    {
        // Arrange
        var (client, _) = await GetAuthenticatedClientAndUserIdAsync();
        var nonExistentMatchId = Guid.NewGuid();
        
        // Act
        var response = await client.PostAsync($"{ApiBase}/playlist/{nonExistentMatchId}", null);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Add match to playlist failed", problem?.Title);
        Assert.Equal(400, problem?.Status);
        Assert.Contains("not found", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task AddMatchToPlaylist_ShouldReturnUpdatedPlaylist_WhenMatchExistsAndNotInPlaylist()
    {
        // Arrange
        var (client, _) = await GetAuthenticatedClientAndUserIdAsync();
        var matchId = await GetSeededMatchIdAsync();
        
        // Act
        var response = await client.PostAsync($"{ApiBase}/playlist/{matchId}", null);
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"AddMatchToPlaylist failed: {response.StatusCode} - {response.ReasonPhrase}");
        }
        var result = await response.Content.ReadFromJsonAsync<PlaylistActionResultDto>();
        
        // Assert
        Assert.True(result?.Succeeded);
        Assert.NotNull(result?.Playlist);
        Assert.Contains(result.Playlist.Matches, m => m.Id == matchId);
    }

    [Fact]
    public async Task RemoveMatchFromPlaylist_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        
        // Act
        var response = await _client.DeleteAsync($"{ApiBase}/playlist/{matchId}");
        
        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RemoveMatchFromPlaylist_ShouldReturnBadRequest_WhenMatchNotInPlaylist()
    {
        // Arrange
        var (client, _) = await GetAuthenticatedClientAndUserIdAsync();
        var matchId = Guid.NewGuid();
        
        // Act
        var response = await client.DeleteAsync($"{ApiBase}/playlist/{matchId}");
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Remove match from playlist failed", problem?.Title);
        Assert.Equal(400, problem?.Status);
        Assert.Contains("not found", problem?.Detail ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RemoveMatchFromPlaylist_ShouldReturnUpdatedPlaylist_WhenMatchInPlaylist()
    {
        // Arrange
        var (client, _) = await GetAuthenticatedClientAndUserIdAsync();
        var matchId = await GetSeededMatchIdAsync();
        await client.PostAsync($"{ApiBase}/playlist/{matchId}", null);
        
        // Act
        var response = await client.DeleteAsync($"{ApiBase}/playlist/{matchId}");
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"RemoveMatchFromPlaylist failed: {response.StatusCode} - {response.ReasonPhrase}");
        }
        var result = await response.Content.ReadFromJsonAsync<PlaylistActionResultDto>();
        
        // Assert
        Assert.True(result?.Succeeded);
        Assert.NotNull(result?.Playlist);
        Assert.DoesNotContain(result.Playlist.Matches, m => m.Id == matchId);
    }
}

