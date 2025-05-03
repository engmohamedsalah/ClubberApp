using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace ClubberApp.Application.Services;

public class StreamUrlService : IStreamUrlService
{
    private readonly IConfiguration _configuration;

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
        var baseUrl = _configuration["StreamSettings:BaseUrl"];
        var path = status == MatchStatus.Live 
            ? _configuration["StreamSettings:LivePath"] 
            : _configuration["StreamSettings:ReplayPath"];

        return $"{baseUrl}{path}{matchId}";
    }
} 