using ClubberApp.Application.Interfaces.Repositories;

namespace ClubberApp.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository UserRepository { get; }
    IMatchRepository MatchRepository { get; }
    IPlaylistRepository PlaylistRepository { get; }

    Task<int> SaveChangesAsync();
}

