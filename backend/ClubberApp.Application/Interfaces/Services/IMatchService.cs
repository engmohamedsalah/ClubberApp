using ClubberApp.Application.DTOs;
using ClubberApp.Application.Enums;

namespace ClubberApp.Application.Interfaces.Services;

public interface IMatchService
{
    Task<IEnumerable<MatchDto>> GetAllMatchesAsync();
    Task<IEnumerable<MatchDto>> GetMatchesByStatusAsync(MatchStatus status);
    Task<IEnumerable<MatchDto>> SearchMatchesAsync(string? searchTerm, MatchStatus? status);
    Task<MatchDto?> GetMatchByIdAsync(Guid id);
    Task<PaginatedResult<MatchDto>> SearchMatchesPaginatedAsync(string? searchTerm, MatchStatus? status, int page, int pageSize);
    // CRUD operations
    Task<MatchDto> CreateMatchAsync(MatchDto matchDto);
    Task<bool> UpdateMatchAsync(Guid id, MatchDto matchDto);
    Task<bool> DeleteMatchAsync(Guid id);
    // Potentially add methods for updating match status (e.g., via background job)
}

