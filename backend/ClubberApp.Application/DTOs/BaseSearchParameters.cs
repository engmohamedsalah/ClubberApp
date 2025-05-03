namespace ClubberApp.Application.DTOs;

/// <summary>
/// Base class for search parameters that includes pagination and sorting
/// </summary>
public abstract class BaseSearchParameters : IPagedRequest, ISortableRequest
{
    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int Page { get; set; } = 1;
    
    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; } = 20;
    
    /// <summary>
    /// Field to sort by
    /// </summary>
    public string? SortBy { get; set; } = "Date";
    
    /// <summary>
    /// Whether to sort in descending order
    /// </summary>
    public bool SortDescending { get; set; } = false;
    
    /// <summary>
    /// Validates the pagination parameters and fixes any invalid values
    /// </summary>
    public virtual void ValidatePagination()
    {
        if (Page < 1) Page = 1;
        if (PageSize < 1) PageSize = 20;
        if (PageSize > 100) PageSize = 100; // Reasonable limit for performance
    }
} 