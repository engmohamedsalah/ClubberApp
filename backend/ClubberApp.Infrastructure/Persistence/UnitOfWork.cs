using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Infrastructure.Persistence;
using ClubberApp.Infrastructure.Repositories;
using System.Threading.Tasks;

namespace ClubberApp.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IUserRepository? _userRepository;
    private IMatchRepository? _matchRepository;
    private IPlaylistRepository? _playlistRepository;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    // Implement IUnitOfWork properties with correct names
    public IUserRepository UserRepository => _userRepository ??= new UserRepository(_context);
    public IMatchRepository MatchRepository => _matchRepository ??= new MatchRepository(_context);
    public IPlaylistRepository PlaylistRepository => _playlistRepository ??= new PlaylistRepository(_context);

    // Implement IUnitOfWork method with correct name
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}

