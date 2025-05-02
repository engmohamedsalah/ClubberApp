using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Interfaces.Repositories;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity); // EF Core tracks changes, so often just needs marking
    void Delete(T entity);
}

