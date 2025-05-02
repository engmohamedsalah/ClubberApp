using System.ComponentModel.DataAnnotations.Schema;

namespace ClubberApp.Domain.Entities;

public class Playlist
{
    // Composite primary key configured in DbContext
    public Guid UserId { get; set; }
    public Guid MatchId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("MatchId")]
    public virtual Match Match { get; set; } = null!;

    public DateTime DateAdded { get; set; } = DateTime.UtcNow;
}
