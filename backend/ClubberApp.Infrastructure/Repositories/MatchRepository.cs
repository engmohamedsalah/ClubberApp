using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Domain.Entities;
using ClubberApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ClubberApp.Infrastructure.Repositories;

public class MatchRepository : GenericRepository<Match>, IMatchRepository
{
    public MatchRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<SearchResult<Match>> SearchMatchesAsync(MatchSearchParameters parameters)
    {
        var query = _dbSet.AsQueryable();

        // Apply status filter if provided
        if (parameters.Status.HasValue)
        {
            query = query.Where(m => m.Status == parameters.Status.Value);
        }

        // Apply competition name filter if provided
        if (!string.IsNullOrWhiteSpace(parameters.CompetitionName))
        {
            var term = parameters.CompetitionName.Trim().ToLower();
            query = query.Where(m => m.Competition.ToLower().Contains(term));
        }

        // Apply sorting
        query = ApplySorting(query, parameters.SortBy, parameters.SortDescending);

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply pagination
        var matches = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new SearchResult<Match>(matches, totalCount, parameters.Page, parameters.PageSize);
    }

    private IQueryable<Match> ApplySorting(IQueryable<Match> query, string? sortBy, bool descending)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
        {
            // Default sort by date if not specified
            return descending 
                ? query.OrderByDescending(m => m.Date) 
                : query.OrderBy(m => m.Date);
        }

        // Apply the requested sort
        return sortBy.ToLower() switch
        {
            "title" => descending 
                ? query.OrderByDescending(m => m.Title) 
                : query.OrderBy(m => m.Title),
            "competition" => descending 
                ? query.OrderByDescending(m => m.Competition) 
                : query.OrderBy(m => m.Competition),
            "date" => descending 
                ? query.OrderByDescending(m => m.Date) 
                : query.OrderBy(m => m.Date),
            "status" => descending 
                ? query.OrderByDescending(m => m.Status) 
                : query.OrderBy(m => m.Status),
            _ => descending 
                ? query.OrderByDescending(m => m.Date) 
                : query.OrderBy(m => m.Date)
        };
    }
}

