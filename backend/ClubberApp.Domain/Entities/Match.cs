namespace ClubberApp.Domain.Entities;

public enum MatchStatus
{
    Live,
    Replay
}

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Competition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public MatchStatus Status { get; set; }

    public virtual ICollection<Playlist> PlaylistEntries { get; set; } = new List<Playlist>();
}
