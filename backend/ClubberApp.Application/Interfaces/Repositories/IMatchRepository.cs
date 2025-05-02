using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Repositories;

public interface IMatchRepository : IGenericRepository<Match>
{
    Task<IEnumerable<Match>> GetMatchesByStatusAsync(MatchStatus status);
    Task<IEnumerable<Match>> SearchMatchesByCompetitionAsync(string competitionName);
}

