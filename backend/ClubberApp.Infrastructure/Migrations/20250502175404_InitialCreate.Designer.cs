﻿// <auto-generated />
using System;
using ClubberApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace ClubberApp.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20250502175404_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.4");

            modelBuilder.Entity("ClubberApp.Domain.Entities.Match", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Competition")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("Date")
                        .HasColumnType("TEXT");

                    b.Property<int>("Status")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Matches");

                    b.HasData(
                        new
                        {
                            Id = new Guid("3e30376f-e079-4b72-9768-417b98a470c7"),
                            Competition = "League 1",
                            Date = new DateTime(2025, 5, 3, 16, 43, 41, 0, DateTimeKind.Utc),
                            Status = 0,
                            Title = "Team A vs Team B"
                        },
                        new
                        {
                            Id = new Guid("194dfef5-573b-4abc-a962-ca713c78bc50"),
                            Competition = "Cup Final",
                            Date = new DateTime(2025, 5, 1, 16, 43, 41, 0, DateTimeKind.Utc),
                            Status = 1,
                            Title = "Team C vs Team D"
                        },
                        new
                        {
                            Id = new Guid("755f9549-04d3-4fc9-a543-97eece49cf70"),
                            Competition = "League 1",
                            Date = new DateTime(2025, 5, 4, 16, 43, 41, 0, DateTimeKind.Utc),
                            Status = 0,
                            Title = "Team E vs Team F"
                        });
                });

            modelBuilder.Entity("ClubberApp.Domain.Entities.Playlist", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("MatchId")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("DateAdded")
                        .HasColumnType("TEXT");

                    b.HasKey("UserId", "MatchId");

                    b.HasIndex("MatchId");

                    b.ToTable("Playlists");
                });

            modelBuilder.Entity("ClubberApp.Domain.Entities.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            Id = new Guid("20c835a1-4279-41bf-8874-b1e18f887bc5"),
                            Email = "test@example.com",
                            PasswordHash = "hashed_password",
                            Username = "testuser"
                        });
                });

            modelBuilder.Entity("ClubberApp.Domain.Entities.Playlist", b =>
                {
                    b.HasOne("ClubberApp.Domain.Entities.Match", "Match")
                        .WithMany("PlaylistEntries")
                        .HasForeignKey("MatchId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ClubberApp.Domain.Entities.User", "User")
                        .WithMany("Playlist")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Match");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ClubberApp.Domain.Entities.Match", b =>
                {
                    b.Navigation("PlaylistEntries");
                });

            modelBuilder.Entity("ClubberApp.Domain.Entities.User", b =>
                {
                    b.Navigation("Playlist");
                });
#pragma warning restore 612, 618
        }
    }
}
