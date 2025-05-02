using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetUserByUsernameAsync(string username);
}

