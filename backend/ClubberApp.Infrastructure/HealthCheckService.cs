using System.Threading.Tasks;
using ClubberApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClubberApp.Infrastructure
{
    public interface IHealthCheckService
    {
        Task<bool> IsDatabaseHealthyAsync();
    }

    public class HealthCheckService : IHealthCheckService
    {
        private readonly ApplicationDbContext _dbContext;
        public HealthCheckService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<bool> IsDatabaseHealthyAsync()
        {
            try
            {
                await _dbContext.Database.ExecuteSqlRawAsync("SELECT 1");
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
} 