using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Application.Interfaces.Services;
using ClubberApp.Application.Mappings;
using ClubberApp.Application.Services;
using ClubberApp.Infrastructure.Persistence;
using ClubberApp.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Configure Services (Dependency Injection) ---

// 1. Database Context
var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
if (!string.Equals(env, "Test", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// 2. Repositories & Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
// Repositories are often registered via UnitOfWork, but can be registered individually if needed elsewhere
// builder.Services.AddScoped<IUserRepository, UserRepository>();
// builder.Services.AddScoped<IMatchRepository, MatchRepository>();
// builder.Services.AddScoped<IPlaylistRepository, PlaylistRepository>();

// 3. Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlaylistService, PlaylistService>();
builder.Services.AddScoped<IStreamUrlService, StreamUrlService>();
builder.Services.AddScoped<ClubberApp.Infrastructure.IHealthCheckService, ClubberApp.Infrastructure.HealthCheckService>();

// 4. AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// 5. Authentication & Authorization
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero // Optional: Adjust tolerance for token expiration
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/problem+json";
            var problem = new {
                type = "https://tools.ietf.org/html/rfc7235#section-3.1",
                title = "Unauthorized",
                status = 401,
                detail = "Authentication is required to access this resource."
            };
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(problem));
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/problem+json";
            var problem = new {
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
                title = "Forbidden",
                status = 403,
                detail = "You do not have permission to access this resource."
            };
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(problem));
        }
    };
});

builder.Services.AddAuthorization();

// 6. Controllers & API Configuration
builder.Services.AddControllers(); // Will discover controllers in subfolders like Controllers/v1
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ClubberApp API", Version = "v1" });

    // Configure Swagger to use JWT
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// 7. CORS (Configure appropriately for your frontend URL)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // Adjust for your Angular app's URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add response caching
builder.Services.AddResponseCaching();

// --- Build the App ---
var app = builder.Build();

// --- Configure the HTTP request pipeline ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Register global error handling middleware
app.UseMiddleware<ClubberApp.Api.ErrorHandlingMiddleware>();

// Apply CORS policy
app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();

app.UseAuthentication(); // Must be before UseAuthorization
app.UseAuthorization();

app.UseResponseCaching();

app.MapControllers();

app.MapGet("/", context => {
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

// --- Database Creation Workaround (Development Only) ---
// Replaces migrations for this challenge due to tooling issues
// if (app.Environment.IsDevelopment())
// {
//     try
//     {
//         using (var scope = app.Services.CreateScope())
//         {
//             var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//             dbContext.Database.EnsureCreated();
//             Console.WriteLine("Database schema ensured."); // Add log for confirmation
//         }
//     }
//     catch (Exception ex)
//     {
//         Console.WriteLine($"An error occurred creating the DB: {ex.Message}");
//         // Optionally log the full exception
//     }
// }
// --- End Workaround ---

app.Run();

// Explicit Program class for test project accessibility
public partial class Program { }

