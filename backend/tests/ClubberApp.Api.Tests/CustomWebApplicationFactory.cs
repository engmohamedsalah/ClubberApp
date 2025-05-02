using ClubberApp.Api;
using ClubberApp.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Linq;
using Microsoft.Data.Sqlite;

namespace ClubberApp.Api.Tests;

// Custom WebApplicationFactory for integration tests
public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove all ApplicationDbContext and DbContextOptions<ApplicationDbContext> registrations (including generic types)
            var dbContextDescriptors = services.Where(d =>
                d.ServiceType == typeof(ApplicationDbContext) ||
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>) && d.ServiceType.GenericTypeArguments[0] == typeof(ApplicationDbContext))
            ).ToList();
            foreach (var descriptor in dbContextDescriptors)
            {
                services.Remove(descriptor);
            }

            // Add ApplicationDbContext using SQLite in-memory for stricter integration tests.
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlite(connection);
            });

            // Build the service provider.
            var sp = services.BuildServiceProvider();

            // Create a scope to obtain a reference to the database context (ApplicationDbContext).
            using (var scope = sp.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<ApplicationDbContext>();

                // Ensure the database is created and migrated.
                db.Database.EnsureCreated();
                // db.Database.Migrate(); // Uncomment if you use migrations

                // Seed the database with test data
                SeedData(db);
            }
        });

        builder.UseEnvironment("Test");
    }

    // Optional: Method to seed data
    private static void SeedData(ApplicationDbContext context)
    {
        // Add a test match with status Live
        if (!context.Matches.Any())
        {
            context.Matches.Add(new ClubberApp.Domain.Entities.Match
            {
                Id = Guid.NewGuid(),
                Title = "Seeded Live Match",
                Competition = "Test League",
                Date = DateTime.UtcNow,
                Status = ClubberApp.Domain.Entities.MatchStatus.Live
            });
            context.SaveChanges();
        }
    }
}

