using ClubberApp.Application.DTOs;
using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Repositories;

public interface IMatchRepository : IGenericRepository<Match>
{
    Task<SearchResult<Match>> SearchMatchesAsync(MatchSearchParameters parameters);
}

