using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using ClubberApp.Application.DTOs;
using System.Text.Json;

namespace ClubberApp.Api.Tests.v1;

public class ProblemDetails
{
    public string? Type { get; set; }
    public string? Title { get; set; }
    public int? Status { get; set; }
    public string? Detail { get; set; }
    public string? Instance { get; set; }
}

public class PaginatedResult<T>
{
    public IEnumerable<T> Data { get; set; } = new List<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}

public class MatchesControllerTests : V1ControllerTestBase
{
    public MatchesControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    // Helper method to get an authenticated client
    private async Task<HttpClient> GetAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient();
        var username = $"matches_test_{Guid.NewGuid().ToString("N").Substring(0, 20)}";
        var password = "password123";
        var registerResponse = await client.PostAsJsonAsync($"{ApiBase}/auth/register", new RegisterDto { Username = username, Password = password });
        if (!registerResponse.IsSuccessStatusCode)
        {
            var errorContent = await registerResponse.Content.ReadAsStringAsync();
            throw new Exception($"Register failed: {errorContent}");
        }
        var loginResponse = await client.PostAsJsonAsync($"{ApiBase}/auth/login", new LoginDto { Username = username, Password = password });
        if (!loginResponse.IsSuccessStatusCode)
        {
            var errorContent = await loginResponse.Content.ReadAsStringAsync();
            throw new Exception($"Login failed: {errorContent}");
        }
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        // If you ever need to extract userId from the token, use FirstOrDefault and log if missing, as in PlaylistControllerTests.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult?.Token);
        return client;
    }

    [Fact]
    public async Task GetAllMatches_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        var response = await _client.GetAsync($"{ApiBase}/matches");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Unauthorized", problem?.Title);
        Assert.Equal(401, problem?.Status);
    }

    [Fact]
    public async Task GetAllMatches_ShouldReturnMatches_WhenAuthenticated()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync($"{ApiBase}/matches");
        if (!response.IsSuccessStatusCode)
        {
            var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            throw new Exception($"GetAllMatches failed: {problem?.Title} - {problem?.Detail}");
        }
        var paginated = await response.Content.ReadFromJsonAsync<PaginatedResult<MatchDto>>();
        Assert.NotNull(paginated);
        Assert.NotNull(paginated.Data);
        Assert.NotEmpty(paginated.Data);
    }

    [Fact]
    public async Task GetLiveMatches_ShouldReturnUnauthorized_WhenNotAuthenticated()
    {
        var response = await _client.GetAsync($"{ApiBase}/matches/live");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Unauthorized", problem?.Title);
        Assert.Equal(401, problem?.Status);
    }

    [Fact]
    public async Task GetLiveMatches_ShouldReturnLiveMatches_WhenAuthenticated()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync($"{ApiBase}/matches/live");
        if (!response.IsSuccessStatusCode)
        {
            var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            throw new Exception($"GetLiveMatches failed: {problem?.Title} - {problem?.Detail}");
        }
        var matches = await response.Content.ReadFromJsonAsync<IEnumerable<MatchDto>>();
        Assert.NotNull(matches);
        Assert.NotEmpty(matches);
    }
}

