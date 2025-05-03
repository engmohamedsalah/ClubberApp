namespace ClubberApp.Application.DTOs;

/// <summary>
/// Interface for pagination parameters in requests
/// </summary>
public interface IPagedRequest
{
    int Page { get; }
    int PageSize { get; }
} 