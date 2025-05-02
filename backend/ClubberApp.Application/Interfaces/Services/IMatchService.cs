using ClubberApp.Application.DTOs;
using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Services;

public interface IMatchService
{
    Task<IEnumerable<MatchDto>> GetAllMatchesAsync();
    Task<IEnumerable<MatchDto>> GetMatchesByStatusAsync(MatchStatus status);
    Task<IEnumerable<MatchDto>> SearchMatchesAsync(string? competitionName, MatchStatus? status);
    Task<MatchDto?> GetMatchByIdAsync(Guid id);
    Task<PaginatedResult<MatchDto>> SearchMatchesPaginatedAsync(string? searchTerm, MatchStatus? status, int page, int pageSize);
    // Potentially add methods for updating match status (e.g., via background job)
}

