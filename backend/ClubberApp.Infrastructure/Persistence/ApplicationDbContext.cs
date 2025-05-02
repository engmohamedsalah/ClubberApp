using ClubberApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClubberApp.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Match> Matches { get; set; } = null!;
    public DbSet<Playlist> Playlists { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure composite key for Playlist entity
        modelBuilder.Entity<Playlist>()
            .HasKey(p => new { p.UserId, p.MatchId });

        // Configure relationships
        modelBuilder.Entity<Playlist>()
            .HasOne(p => p.User)
            .WithMany(u => u.Playlist)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade); // Or Restrict depending on requirements

        modelBuilder.Entity<Playlist>()
            .HasOne(p => p.Match)
            .WithMany(m => m.PlaylistEntries)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade); // Or Restrict

        // Seed initial data (optional, but useful for testing)
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Use static GUIDs and dates for seeding
        var user1Id = Guid.Parse("20C835A1-4279-41BF-8874-B1E18F887BC5");
        modelBuilder.Entity<User>().HasData(
            new User { Id = user1Id, Username = "testuser", Email = "test@example.com", PasswordHash = "hashed_password" }
        );

        // Seed Matches with static GUIDs and dates
        var match1Id = Guid.Parse("3E30376F-E079-4B72-9768-417B98A470C7");
        var match2Id = Guid.Parse("194DFEF5-573B-4ABC-A962-CA713C78BC50");
        var match3Id = Guid.Parse("755F9549-04D3-4FC9-A543-97EECE49CF70");
        modelBuilder.Entity<Match>().HasData(
            new Match { Id = match1Id, Title = "Team A vs Team B", Competition = "League 1", Date = new DateTime(2025, 5, 3, 16, 43, 41, DateTimeKind.Utc), Status = MatchStatus.Live },
            new Match { Id = match2Id, Title = "Team C vs Team D", Competition = "Cup Final", Date = new DateTime(2025, 5, 1, 16, 43, 41, DateTimeKind.Utc), Status = MatchStatus.Replay },
            new Match { Id = match3Id, Title = "Team E vs Team F", Competition = "League 1", Date = new DateTime(2025, 5, 4, 16, 43, 41, DateTimeKind.Utc), Status = MatchStatus.Live }
        );

        // Optionally seed Playlist entries with static values
        // modelBuilder.Entity<Playlist>().HasData(
        //     new Playlist { UserId = user1Id, MatchId = match1Id, DateAdded = new DateTime(2025, 5, 3, 16, 43, 41, DateTimeKind.Utc) }
        // );
    }
}
