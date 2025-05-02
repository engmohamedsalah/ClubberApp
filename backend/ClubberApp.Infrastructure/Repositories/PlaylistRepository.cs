using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Domain.Entities;
using ClubberApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClubberApp.Infrastructure.Repositories;

public class PlaylistRepository : IPlaylistRepository
{
    private readonly ApplicationDbContext _context;

    public PlaylistRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Playlist?> FindByKeysAsync(Guid userId, Guid matchId)
    {
        return await _context.Playlists.FindAsync(userId, matchId);
    }

    public async Task<IEnumerable<Match>> GetMatchesByUserIdAsync(Guid userId)
    {
        // Retrieve matches associated with the user through the Playlist join table
        return await _context.Playlists
            .Where(p => p.UserId == userId)
            .Select(p => p.Match) // Select the related Match entity
            .ToListAsync();
    }

    public async Task AddAsync(Playlist playlistEntry)
    {
        await _context.Playlists.AddAsync(playlistEntry);
        // SaveChangesAsync will be called by UnitOfWork
    }

    public void Remove(Playlist playlistEntry)
    {
        _context.Playlists.Remove(playlistEntry);
        // SaveChangesAsync will be called by UnitOfWork
    }
}

