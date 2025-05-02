using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ClubberApp.Application.Services;

public class MatchService : IMatchService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MatchService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<MatchDto>> GetAllMatchesAsync()
    {
        var matches = await _unitOfWork.MatchRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<MatchDto>>(matches);
    }

    public async Task<MatchDto?> GetMatchByIdAsync(Guid id)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        return _mapper.Map<MatchDto>(match);
    }

    // Note: Assumes MatchCreateDto has Title, Competition, Date, Status properties
    public async Task<MatchDto> CreateMatchAsync(MatchCreateDto matchDto)
    {
        var match = _mapper.Map<Match>(matchDto);
        await _unitOfWork.MatchRepository.AddAsync(match);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<MatchDto>(match);
    }

    // Note: Assumes MatchUpdateDto has Title, Competition, Date, Status properties
    public async Task<bool> UpdateMatchAsync(Guid id, MatchUpdateDto matchDto)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        if (match == null) return false;

        _mapper.Map(matchDto, match);
        _unitOfWork.MatchRepository.Update(match);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteMatchAsync(Guid id)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        if (match == null) return false;

        _unitOfWork.MatchRepository.Delete(match); // Changed from Remove to Delete
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<MatchDto>> GetMatchesByStatusAsync(MatchStatus status)
    {
        // Use the specific repository method if available, otherwise filter
        // Assuming IMatchRepository has GetMatchesByStatusAsync
        var matches = await _unitOfWork.MatchRepository.GetMatchesByStatusAsync(status);
        return _mapper.Map<IEnumerable<MatchDto>>(matches);
    }

    public async Task<IEnumerable<MatchDto>> SearchMatchesAsync(string? searchTerm, MatchStatus? status)
    {
        // Get all matches and filter in memory since FindAsync is not available
        var allMatches = await _unitOfWork.MatchRepository.GetAllAsync();
        var query = allMatches.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            // Use Title and Competition properties from Match entity
            query = query.Where(m => m.Title.ToLower().Contains(term) ||
                                      m.Competition.ToLower().Contains(term));
        }

        return _mapper.Map<IEnumerable<MatchDto>>(query.ToList());
    }

    public async Task<PaginatedResult<MatchDto>> SearchMatchesPaginatedAsync(string? searchTerm, MatchStatus? status, int page, int pageSize)
    {
        var allMatches = await _unitOfWork.MatchRepository.GetAllAsync();
        var query = allMatches.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(m => m.Title.ToLower().Contains(term) ||
                                      m.Competition.ToLower().Contains(term));
        }

        var totalCount = query.Count();
        var paged = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        var pagedDtos = _mapper.Map<List<MatchDto>>(paged);
        return new PaginatedResult<MatchDto>(pagedDtos, page, pageSize, totalCount);
    }
}

// PredicateBuilder is not needed if filtering in memory

