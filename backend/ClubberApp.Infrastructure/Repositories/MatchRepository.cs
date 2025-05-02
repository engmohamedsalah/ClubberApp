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

    public async Task<IEnumerable<Match>> GetMatchesByStatusAsync(MatchStatus status)
    {
        return await _dbSet.Where(m => m.Status == status).ToListAsync();
    }

    public async Task<IEnumerable<Match>> SearchMatchesByCompetitionAsync(string competitionName)
    {
        // Basic case-insensitive search
        return await _dbSet.Where(m => m.Competition.ToLower().Contains(competitionName.ToLower())).ToListAsync();
    }
}

