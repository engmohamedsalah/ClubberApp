namespace ClubberApp.Domain.Entities;

public enum MatchStatus
{
    Live,
    Replay
}

public enum MatchAvailability
{
    Available,
    Unavailable,
    Scheduled, // For future matches
    Restricted // For geo-restricted content or rights issues
}

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Competition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public MatchStatus Status { get; set; }
    public MatchAvailability Availability { get; set; } = MatchAvailability.Available;
    public string StreamURL { get; set; } = string.Empty;
    
    // Added fields to align with frontend
    public string[] Teams { get; set; } = Array.Empty<string>();
    public string Location { get; set; } = string.Empty;
    public string Thumbnail { get; set; } = string.Empty;

    public virtual ICollection<Playlist> PlaylistEntries { get; set; } = new List<Playlist>();
}
