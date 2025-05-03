using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Services;

public interface IStreamUrlService
{
    string GenerateStreamUrl(Match match);
    string GenerateStreamUrl(Guid matchId, MatchStatus status);
} 