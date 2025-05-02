using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Repositories;

// Interface for the Playlist join entity repository
public interface IPlaylistRepository
{
    Task<Playlist?> FindByKeysAsync(Guid userId, Guid matchId);
    Task<IEnumerable<Match>> GetMatchesByUserIdAsync(Guid userId);
    Task AddAsync(Playlist playlistEntry);
    void Remove(Playlist playlistEntry);
    // Note: IUnitOfWork will handle SaveChangesAsync
}

