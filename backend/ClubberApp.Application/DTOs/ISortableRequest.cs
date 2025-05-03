namespace ClubberApp.Application.DTOs;

/// <summary>
/// Interface for sorting parameters in requests
/// </summary>
public interface ISortableRequest
{
    string? SortBy { get; }
    bool SortDescending { get; }
} 