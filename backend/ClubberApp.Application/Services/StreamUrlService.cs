using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace ClubberApp.Application.Services;

public class StreamUrlService : IStreamUrlService
{
    private readonly IConfiguration _configuration;
    private const string DEV_BASE_URL = "https://dev-stream.example.com/";

    public StreamUrlService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateStreamUrl(Match match)
    {
        // Don't generate URLs for matches that aren't available
        if (match.Availability != MatchAvailability.Available)
            return string.Empty;
            
        return GenerateStreamUrl(match.Id, match.Status);
    }

    public string GenerateStreamUrl(Guid matchId, MatchStatus status)
    {
        var baseUrl = _configuration["StreamSettings:BaseUrl"] ?? string.Empty;
        var developmentMockStreamUrl = _configuration["StreamSettings:DevelopmentMockStreamUrl"] ?? string.Empty;
        string path = string.Empty;

        // Check if we are in a development-like scenario with a placeholder BaseUrl
        // and a specific mock URL is provided.
        if (baseUrl == DEV_BASE_URL && !string.IsNullOrEmpty(developmentMockStreamUrl))
        {
            switch (status)
            {
                case MatchStatus.Live:
                case MatchStatus.OnDemand:
                    return developmentMockStreamUrl; // Return the actual mock URL
                case MatchStatus.Upcoming:
                case MatchStatus.Canceled:
                default:
                    return string.Empty; // No URLs for upcoming or canceled matches
            }
        }

        // Original logic for non-development placeholder scenarios or if mock URL isn't set
        switch (status)
        {
            case MatchStatus.Live:
                path = _configuration["StreamSettings:LivePath"] ?? string.Empty;
                break;
            case MatchStatus.OnDemand:
                path = _configuration["StreamSettings:ReplayPath"] ?? string.Empty;
                break;
            case MatchStatus.Upcoming:
            case MatchStatus.Canceled:
            default:
                return string.Empty; // No URLs for upcoming or canceled matches
        }

        if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(path))
        {
            // Avoid returning just the matchId if config is missing
            return string.Empty; 
        }

        return $"{baseUrl}{path}{matchId}";
    }
} 