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
        var parameters = new MatchSearchParameters
        {
            Page = 1,
            PageSize = int.MaxValue
        };
        
        var result = await _unitOfWork.MatchRepository.SearchMatchesAsync(parameters);
        return EnrichMatchDtos(result.Items, result.Items);
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
        if (string.IsNullOrEmpty(match.StreamURL))
        {
            match.StreamURL = _streamUrlService.GenerateStreamUrl(match);
        }
        await _unitOfWork.MatchRepository.AddAsync(match);
        await _unitOfWork.SaveChangesAsync();
        matchDto.Id = match.Id;
        return matchDto;
    }

    // Updated to use the unified MatchDto
    public async Task<bool> UpdateMatchAsync(Guid id, MatchDto matchDto)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(id);
        if (match == null) return false;
        matchDto.Id = id;
        _mapper.Map(matchDto, match);
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
        
        var parameters = new MatchSearchParameters
        {
            Status = domainStatus,
            Page = 1,
            PageSize = int.MaxValue
        };
        
        var result = await _unitOfWork.MatchRepository.SearchMatchesAsync(parameters);
        return EnrichMatchDtos(result.Items, result.Items);
    }

    // Updated to use Enums.MatchStatus instead of DTOs.MatchStatus
    public async Task<IEnumerable<MatchDto>> SearchMatchesAsync(string? searchTerm, Enums.MatchStatus? status)
    {
        // Convert DTO status to domain status for repository call
        Domain.Entities.MatchStatus? domainStatus = null;
        if (status.HasValue)
        {
            domainStatus = _mapper.Map<Domain.Entities.MatchStatus>(status.Value);
        }
        
        var parameters = new MatchSearchParameters
        {
            CompetitionName = searchTerm,
            Status = domainStatus,
            Page = 1,
            PageSize = int.MaxValue
        };
        
        var result = await _unitOfWork.MatchRepository.SearchMatchesAsync(parameters);
        return EnrichMatchDtos(result.Items, result.Items);
    }

    // Updated to use Enums.MatchStatus instead of DTOs.MatchStatus
    public async Task<PaginatedResult<MatchDto>> SearchMatchesPaginatedAsync(string? searchTerm, Enums.MatchStatus? status, int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        // Map DTO status to domain status if provided
        Domain.Entities.MatchStatus? domainStatus = null;
        if (status.HasValue)
        {
            domainStatus = _mapper.Map<Domain.Entities.MatchStatus>(status.Value);
        }
        
        var parameters = new MatchSearchParameters
        {
            CompetitionName = searchTerm,
            Status = domainStatus,
            Page = page,
            PageSize = pageSize,
            SortBy = sortBy,
            SortDescending = sortDescending
        };
        
        // Use the repository method for efficient database querying
        var result = await _unitOfWork.MatchRepository.SearchMatchesAsync(parameters);
        
        // Map to DTOs and enrich
        var matchDtos = EnrichMatchDtos(result.Items, result.Items);
        
        return new PaginatedResult<MatchDto>(matchDtos, result.Page, result.PageSize, result.TotalCount);
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

