namespace ClubberApp.Application.DTOs;

public class SearchResult<T>
{
    public IEnumerable<T> Items { get; }
    public int TotalCount { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;

    public SearchResult(IEnumerable<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }
} 