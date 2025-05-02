using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Domain.Entities;
using ClubberApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClubberApp.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }
}

