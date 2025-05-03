using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.DTOs;

/// <summary>
/// Parameters for searching matches
/// </summary>
public class MatchSearchParameters : BaseSearchParameters
{
    /// <summary>
    /// Competition name to filter by
    /// </summary>
    public string? CompetitionName { get; set; }
    
    /// <summary>
    /// Match status to filter by
    /// </summary>
    public MatchStatus? Status { get; set; }
    
    /// <summary>
    /// Default constructor
    /// </summary>
    public MatchSearchParameters()
    {
    }
    
    /// <summary>
    /// Constructor with common search parameters
    /// </summary>
    public MatchSearchParameters(string? competitionName, MatchStatus? status)
    {
        CompetitionName = competitionName;
        Status = status;
        ValidatePagination();
    }
    
    /// <summary>
    /// Creates a copy of these parameters with specified modifications
    /// </summary>
    public MatchSearchParameters With(Action<MatchSearchParameters> changes)
    {
        var copy = (MatchSearchParameters)MemberwiseClone();
        changes(copy);
        copy.ValidatePagination();
        return copy;
    }
} 