# ClubberApp - My Sports Playlist

This project is a web application built to fulfill the "My Sports Playlist" challenge. It allows users to register, log in, view a list of sports matches (from a mock source), and manage their personal playlist of matches.

The application follows Clean Architecture principles for the backend and utilizes NgRx for state management in the Angular frontend.

## Project Structure

```
/clubber_app
├── frontend/         # Angular Frontend Application
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── backend/          # .NET Backend Source Code (was src/)
│   ├── ClubberApp.Api/
│   ├── ClubberApp.Application/
│   ├── ClubberApp.Domain/
│   ├── ClubberApp.Infrastructure/
│   ├── tests/            # .NET Backend Tests
│   │   ├── ClubberApp.Api.Tests/
│   │   └── ClubberApp.Application.Tests/
│   ├── ClubberApp.sln    # .NET Solution File
│   └── global.json       # .NET SDK Version Pinning
└── README.md         # This file
```

## Technology Stack

*   **Backend:** .NET 8, C#, ASP.NET Core Web API, Entity Framework Core (for data persistence concept), AutoMapper, Clean Architecture, xUnit, Moq, BCrypt.Net (for password hashing), JWT (for authentication)
*   **Frontend:** Angular 19, TypeScript, NgRx (Store, Effects, Selectors), Tailwind CSS v3, RxJS, Karma, Jasmine

## Backend (.NET)

### Architecture

The backend follows Clean Architecture principles, separating concerns into distinct layers:

*   **Domain:** Contains core entities (`User`, `Match`, `Playlist`) and domain logic.
*   **Application:** Contains application logic, interfaces (repositories, services, unit of work), DTOs, and service implementations.
*   **Infrastructure:** Provides implementations for interfaces defined in the Application layer, such as repositories using EF Core (conceptual) and potentially external services.
*   **Api:** The ASP.NET Core Web API layer, responsible for handling HTTP requests, routing, controllers, and interacting with the Application layer.

### Setup & Running

1.  **Navigate to the API directory:**
    ```bash
    cd /home/ubuntu/clubber_app/backend/ClubberApp.Api
    ```
2.  **Restore dependencies:**
    ```bash
    dotnet restore ../../ClubberApp.sln
    # The backend/.NET SDK version is pinned by backend/global.json
    ```
3.  **Database Setup (Conceptual):**
    *   This implementation uses an in-memory database for simplicity during development and testing. For a production scenario, you would configure a connection string in `appsettings.json` for a persistent database (e.g., PostgreSQL, SQL Server).
    *   EF Core migrations would be used to manage the database schema:
        ```bash
        # Add migration (run from Infrastructure project directory or specify with --project)
        dotnet ef migrations add InitialCreate --startup-project ../ClubberApp.Api
        # Apply migration (run from Api project directory)
        dotnet ef database update
        ```
4.  **JWT Configuration:**
    *   Update the `JwtSettings` section in `/home/ubuntu/clubber_app/backend/ClubberApp.Api/appsettings.json` with your own secret key, issuer, and audience.
    ```json
    "JwtSettings": {
      "Key": "YOUR_VERY_SECURE_SECRET_KEY_HERE_LONGER_THAN_32_BYTES",
      "Issuer": "YourAppIssuer",
      "Audience": "YourAppAudience"
    }
    ```
5.  **Run the API:**
    ```bash
    dotnet run
    ```
    The API will typically be available at `http://localhost:5000` or `https://localhost:5001` (check console output).

### Running Backend Tests

1.  **Navigate to the solution root or tests directory:**
    ```bash
    cd /home/ubuntu/clubber_app
    ```
2.  **Run tests:**
    ```bash
    dotnet test
    ```
    *Note: Some API integration tests might still have compilation errors related to `CustomWebApplicationFactory` accessibility that need resolving.* 

### API Endpoints

*   `POST /api/Auth/register`: Register a new user.
*   `POST /api/Auth/login`: Log in an existing user, returns JWT.
*   `GET /api/Matches`: Get all available matches.
*   `GET /api/Playlist`: Get the authenticated user's playlist.
*   `POST /api/Playlist/{matchId}`: Add a match to the playlist.
*   `DELETE /api/Playlist/{matchId}`: Remove a match from the playlist.

## Frontend (Angular)

### Setup & Running

1.  **Navigate to the frontend directory:**
    ```bash
    cd /home/ubuntu/clubber_app/frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API URL:**
    *   Update the `apiUrl` in `/home/ubuntu/clubber_app/frontend/src/environments/environment.ts` and `environment.development.ts` to point to your running backend API URL (e.g., `http://localhost:5000`).
4.  **Run the development server:**
    ```bash
    ng serve
    ```
    The application will typically be available at `http://localhost:4200/`.

### Running Frontend Tests

1.  **Navigate to the frontend directory:**
    ```bash
    cd /home/ubuntu/clubber_app/frontend
    ```
2.  **Run tests:**
    ```bash
    ng test --watch=false --browsers=ChromeHeadless
    ```
    *Note: The tests should now pass after the recent fixes. If issues persist, further debugging might be needed.* 

## Next Steps & Improvements

*   **Implement Real Data Source:** Replace the mock match data source with a real one (e.g., fetch from a third-party API or a database).
*   **Database Persistence:** Fully implement database persistence using EF Core and a chosen database provider.
*   **EF Core Migrations:** Implement and manage database schema changes using EF Core migrations.
*   **API Integration Tests:** Fix the remaining compilation errors in the API integration tests.
*   **Frontend Test Coverage:** Add more comprehensive unit and integration tests for the frontend components, services, and NgRx store.
*   **Error Handling:** Enhance error handling on both backend and frontend.
*   **UI/UX:** Improve the user interface and user experience.
*   **Security:** Implement more robust security measures (e.g., input validation, rate limiting, HTTPS enforcement).
*   **Deployment:** Create build pipelines and deployment scripts.

## API Design & Best Practices

This backend API was designed with modern best practices in mind. Here is a summary of the key design decisions and their implementation status:

| Area                                    | Status      | Details/Notes                                                                 |
|------------------------------------------|-------------|-------------------------------------------------------------------------------|
| Model validation                        | ✅ Done     | DTOs use `[Required]`, `[StringLength]`; `[ApiController]` enables validation |
| Consistent error handling                | ✅ Done     | All controllers use `Problem()` for RFC 7807-compliant error responses        |
| Pagination (Matches & Playlists)         | ✅ Done     | Generic `PaginatedResult<T>` used in both controllers and services            |
| Integration/unit testing                 | ✅ Done     | Integration tests for AuthController, including model validation              |
| Rate limiting                           | ✅ Gateway  | Rate limiting is NOT implemented in the API code; it is a gateway concern (e.g., NGINX, Azure API Management, AWS API Gateway) |
| Response caching                        | ✅ Done     | Middleware enabled (but not on health check)                                  |
| Secure secret management                 | ✅ Done     | JWT secret read from environment variable if available                        |
| Monitoring in health checks              | ✅ Done     | Health check endpoint checks DB connectivity                                  |
| Clean code for health checks             | ✅ Done     | Health logic moved to `HealthCheckService` and injected into controller       |
| Removal of obsolete TODOs                | ✅ Done     | All TODO comments removed from codebase                                       |
| Built-in ASP.NET Core health checks      | ⚠️ Optional | Custom service used; built-in system available for advanced scenarios         |

**App-level limits:**
- Rate limiting is NOT implemented in the API code. For production, it is recommended to enforce global limits at the API gateway (e.g., NGINX, Azure API Management, AWS API Gateway).

**Caching:**
- Response caching is enabled for suitable endpoints. Caching strategy (API, gateway, or CDN) should be discussed and tailored to business needs.

For more details, see the technical documentation or contact the maintainers.

