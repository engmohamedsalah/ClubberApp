using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Enums;
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
    private readonly IStreamUrlService _streamUrlService;

    public MatchService(IUnitOfWork unitOfWork, IMapper mapper, IStreamUrlService streamUrlService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _streamUrlService = streamUrlService;
    }

    public async Task<IEnumerable<MatchDto>> GetAllMatchesAsync()
    {
        var matches = await _unitOfWork.MatchRepository.GetAllAsync();
        return EnrichMatchDtos(matches, matches);
    }

    public async Task<MatchDto?> GetMatchByIdAsync(Guid id)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        if (match == null) return null;
        
        var matchDto = _mapper.Map<MatchDto>(match);
        
        // Generate StreamURL if not already present
        if (string.IsNullOrEmpty(match.StreamURL))
        {
            matchDto.StreamURL = _streamUrlService.GenerateStreamUrl(match);
        }
        
        return matchDto;
    }

    // Updated to use the unified MatchDto
    public async Task<MatchDto> CreateMatchAsync(MatchDto matchDto)
    {
        var match = _mapper.Map<Match>(matchDto);
        
        // Generate StreamURL if not provided
        if (string.IsNullOrEmpty(match.StreamURL))
        {
            match.StreamURL = _streamUrlService.GenerateStreamUrl(match);
        }
        
        await _unitOfWork.MatchRepository.AddAsync(match);
        await _unitOfWork.SaveChangesAsync();
        
        // Set the generated ID
        matchDto.Id = match.Id;
        return matchDto;
    }

    // Updated to use the unified MatchDto
    public async Task<bool> UpdateMatchAsync(Guid id, MatchDto matchDto)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        if (match == null) return false;

        // Ensure the ID is set correctly
        matchDto.Id = id;
        _mapper.Map(matchDto, match);
        
        // Generate StreamURL if not provided
        if (string.IsNullOrEmpty(match.StreamURL))
        {
            match.StreamURL = _streamUrlService.GenerateStreamUrl(match);
        }
        
        _unitOfWork.MatchRepository.Update(match);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteMatchAsync(Guid id)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        if (match == null) return false;

        _unitOfWork.MatchRepository.Delete(match);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    // Updated to use Enums.MatchStatus instead of DTOs.MatchStatus
    public async Task<IEnumerable<MatchDto>> GetMatchesByStatusAsync(Enums.MatchStatus status)
    {
        // Convert DTO status to domain status for repository call
        var domainStatus = _mapper.Map<Domain.Entities.MatchStatus>(status);
        var matches = await _unitOfWork.MatchRepository.GetMatchesByStatusAsync(domainStatus);
        return EnrichMatchDtos(matches, matches);
    }

    // Updated to use Enums.MatchStatus instead of DTOs.MatchStatus
    public async Task<IEnumerable<MatchDto>> SearchMatchesAsync(string? searchTerm, Enums.MatchStatus? status)
    {
        // Get all matches and filter in memory since FindAsync is not available
        var allMatches = await _unitOfWork.MatchRepository.GetAllAsync();
        var filteredMatches = FilterMatches(allMatches, searchTerm, status);
        return EnrichMatchDtos(filteredMatches, allMatches);
    }

    // Updated to use Enums.MatchStatus instead of DTOs.MatchStatus
    public async Task<PaginatedResult<MatchDto>> SearchMatchesPaginatedAsync(string? searchTerm, Enums.MatchStatus? status, int page, int pageSize)
    {
        var allMatches = await _unitOfWork.MatchRepository.GetAllAsync();
        var filteredMatches = FilterMatches(allMatches, searchTerm, status);
        
        var totalCount = filteredMatches.Count();
        var paged = filteredMatches.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        var pagedDtos = EnrichMatchDtos(paged, allMatches);
        
        return new PaginatedResult<MatchDto>(pagedDtos, page, pageSize, totalCount);
    }
    
    // Private helper methods to reduce code duplication
    
    private List<MatchDto> EnrichMatchDtos(IEnumerable<Match> matches, IEnumerable<Match> sourceMatches)
    {
        var matchDtos = _mapper.Map<List<MatchDto>>(matches);
        
        // Generate StreamURL for each match if needed
        foreach (var matchDto in matchDtos)
        {
            var match = sourceMatches.FirstOrDefault(m => m.Id == matchDto.Id);
            if (match != null && string.IsNullOrEmpty(match.StreamURL))
            {
                matchDto.StreamURL = _streamUrlService.GenerateStreamUrl(match);
            }
        }
        
        return matchDtos;
    }
    
    private IEnumerable<Match> FilterMatches(IEnumerable<Match> matches, string? searchTerm, Enums.MatchStatus? status)
    {
        var query = matches.AsQueryable();

        if (status.HasValue)
        {
            var domainStatus = _mapper.Map<Domain.Entities.MatchStatus>(status.Value);
            query = query.Where(m => m.Status == domainStatus);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(m => m.Title.ToLower().Contains(term) ||
                                      m.Competition.ToLower().Contains(term));
        }

        return query.ToList();
    }
}

// PredicateBuilder is not needed if filtering in memory

