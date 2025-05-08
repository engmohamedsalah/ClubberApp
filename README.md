# ClubberApp - My Sports Playlist

 The web application serves as a solution to the "My Sports Playlist" challenge. Users can register  and log in to view sports matches from a pre-defined set (seeded into the database) while managing their personal match playlist.

The application  implements Clean Architecture principles for backend development and NgRx state management in its Angular frontend.


## Business Understanding

### User Experience (UX)
 The playlists function on Clubber TV maintains user interest and encourages users to stay active on the  application. The platform uses trained machine learning (ML) models to analyze user personas and listening habits which enables  it to provide personalized recommendations that fit individual tastes. The platform benefits from user satisfaction improvement while Clubber  TV gains trend insights to work with popular artists and promote new tracks and events. Playlists enable the  platform to host sponsored content and targeted ads which helps attract sponsors and increase revenue growth.


### Business Benefits
Playlists help Clubber TV keep  users coming back. When people create or follow playlists, they spend more time on the app, which  means they're less likely to leave for other platforms. This also gives Clubber TV data about what  users like, so they can recommend better content or work with popular artists. Plus, playlists can be  used to promote new music or events, helping Clubber TV grow its audience and attract sponsors or advertisers.
 

## Setup Instructions

For a quick start with both frontend and backend development environments, use the `start-dev.sh` script located in the project root:
```bash
./start-dev.sh
```
For detailed setup instructions for the backend and frontend, please refer to their respective sections further down in this README:
*   [Backend Setup & Running](#backend-net)
*   [Frontend Setup & Running](#frontend-angular)

## API Documentation

The backend provides a RESTful API for user authentication, managing matches, and handling playlists. Key endpoints include:

*   `POST /api/Auth/register`: Register a new user.
*   `POST /api/Auth/login`: Log in an existing user, returns JWT.
*   `GET /api/Matches`: Get available matches (supports filtering and pagination).
*   `GET /api/Playlist`: Get the authenticated user's playlist.
*   `POST /api/Playlist/{matchId}`: Add a match to the user's playlist.
*   `DELETE /api/Playlist/{matchId}`: Remove a match from the user's playlist.

For more details on request/response formats and parameters, please refer to the [API Endpoints](#api-endpoints) section and the backend controller source code in `backend/ClubberApp.Api/Controllers/`.

## Development Scripts

For easier development, use these convenient scripts from the project root:

- **Start both servers:**
  ```bash
  ./start-dev.sh
  ```
  This starts both the .NET backend and Angular frontend servers in a single command.

- **Stop both servers:**
  ```bash
  ./stop-dev.sh
  ```
  This stops both servers and cleans up any processes.

These scripts handle proper process management and provide clear feedback about the running services.

## Project Structure

```
/clubber_app
├── frontend/         # Angular Frontend Application
│   ├── src/
│   │   └── app/      # Main application code
│   │       ├── core/         # Core module (singleton services, guards, interceptors)
│   │       │   └── services/   # e.g., auth.service.ts, logger.service.ts
│   │       │   └── guards/     # e.g., auth.guard.ts
│   │       │   └── interceptors/ # e.g., jwt.interceptor.ts
│   │       │   └── core.module.ts
│   │       ├── shared/       # Shared module (common components, directives, pipes)
│   │       │   └── components/ # e.g., loading-spinner.component.ts
│   │       │   └── pipes/      # e.g., custom-date.pipe.ts
│   │       │   └── directives/ # e.g., highlight.directive.ts
│   │       │   └── shared.module.ts
│   │       ├── features/     # Feature modules (grouped by application feature)
│   │       │   ├── auth/       # Authentication feature
│   │       │   │   ├── components/ # e.g., login.component.ts, register.component.ts
│   │       │   │   ├── store/      # NgRx state for auth
│   │       │   │   └── auth.module.ts
│   │       │   ├── matches/    # Matches feature
│   │       │   │   ├── components/ # e.g., match-list.component.ts, match-item.component.ts
│   │       │   │   ├── services/   # e.g., matches.service.ts (if feature-specific)
│   │       │   │   ├── store/      # NgRx state for matches
│   │       │   │   └── matches.module.ts
│   │       │   └── playlist/   # Playlist feature
│   │       │       ├── components/ # e.g., playlist-view.component.ts
│   │       │       ├── store/      # NgRx state for playlist
│   │       │       └── playlist.module.ts
│   │       ├── store/        # Root NgRx store setup
│   │       │   └── index.ts    # Root reducers, meta-reducers
│   │       ├── app-routing.module.ts
│   │       └── app.module.ts
│   │       └── app.component.ts
│   ├── assets/       # Static assets (images, fonts, etc.)
│   ├── environments/ # Environment configuration
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
├── start-dev.sh      # Script to start both frontend and backend
├── stop-dev.sh       # Script to stop both servers
└── README.md         # This file
```

## Technology Stack

This project leverages a modern technology stack to deliver a robust and scalable application:

### Backend Technologies
*   **Framework & Language:** .NET 8 with C#, ASP.NET Core Web API
*   **Architecture:** Clean Architecture principles
*   **Data Persistence:** Entity Framework Core with SQLite for the main application, and an in-memory SQLite database for integration testing.
*   **API & Utilities:**
    *   AutoMapper for object-to-object mapping
    *   JSON Web Tokens (JWT) for secure authentication
    *   BCrypt.Net for robust password hashing
*   **Testing:** xUnit (unit testing), Moq (mocking framework)

### Frontend Technologies
*   **Framework & Language:** Angular (version 19) with TypeScript
*   **State Management:** NgRx (utilizing Store, Effects, and Selectors)
*   **Styling:** Tailwind CSS (version 3)
*   **Reactive Programming:** RxJS
*   **Testing:** Karma (test runner), Jasmine (testing framework)

## Backend (.NET)

### Architecture

The backend follows Clean Architecture principles, separating concerns into distinct layers:

*   **Domain:** Contains core entities (`User`, `Match`, `Playlist`) and domain logic.
*   **Application:** Contains application logic, interfaces (repositories, services, unit of work), DTOs, and service implementations.
*   **Infrastructure:** Provides implementations for interfaces defined in the Application layer, such as repositories using EF Core with SQLite, and potentially external services.
*   **Api:** The ASP.NET Core Web API layer, responsible for handling HTTP requests, routing, controllers, and interacting with the Application layer.

### Setup & Running

1.  **Navigate to the API directory:**
    ```bash
    # From the project root directory
    cd backend/ClubberApp.Api
    ```
2.  **Restore dependencies:**
    ```bash
    dotnet restore ../../ClubberApp.sln
    # The backend/.NET SDK version is pinned by backend/global.json
    ```
3.  **Database Setup:**
    *   This implementation uses a **SQLite database** for the main application, which is simple to set up for development. Integration tests utilize an **in-memory SQLite database**. For a production scenario, you would typically configure a connection string in `appsettings.json` for a more robust persistent database (e.g., PostgreSQL, SQL Server).
    *   EF Core migrations are used to manage the database schema:
        ```bash
        # To add a new migration (run from the project root, targeting the Infrastructure project):
        dotnet ef migrations add <MigrationName> --project backend/ClubberApp.Infrastructure --startup-project backend/ClubberApp.Api
        # To apply migrations to the database (run from the project root):
        dotnet ef database update --startup-project backend/ClubberApp.Api
        ```
4.  **JWT Configuration:**
    *   Update the `JwtSettings` section in `backend/ClubberApp.Api/appsettings.json` (relative to the project root) with your own secret key, issuer, and audience.
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
    The API will typically be available at **`http://localhost:5008`** (for HTTP) and **`https://localhost:7130`** (for HTTPS) when running with `dotnet run`. Always check the console output for the exact URLs.

### Running Backend Tests

1.  **Navigate to the project root directory or the backend tests directory:**
    ```bash
    # From the project root
    cd backend/tests/ClubberApp.Api.Tests 
    # Or, to run all tests in the solution from the project root:
    # cd . 
    ```
2.  **Run tests:**
    ```bash
    dotnet test ../../ClubberApp.sln 
    # Or, if in a specific test project directory: dotnet test
    ```
    *Note: Verify the status of API integration tests, particularly any related to `CustomWebApplicationFactory` accessibility, and resolve if necessary.*

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
    # From the project root directory
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API URL:**
    *   Update the `apiUrl` in `frontend/src/environments/environment.ts` and `frontend/src/environments/environment.development.ts` (relative to the project root) to point to your running backend API URL (e.g., `http://localhost:5000`).
4.  **Run the development server:**
    ```bash
    ng serve
    ```
    The application will typically be available at `http://localhost:4200/`.

### Running Frontend Tests

1.  **Navigate to the frontend directory:**
    ```bash
    # From the project root directory
    cd frontend
    ```
2.  **Run tests:**
    ```bash
    ng test --watch=false --browsers=ChromeHeadless
    ```
    *Note: The tests should now pass after the recent fixes. If issues persist, further debugging might be needed.*

## Next Steps & Improvements

*   **Implement Real Data Source:** While matches are currently seeded, consider replacing this with a dynamic data source (e.g., fetching from a third-party sports API).
*   **Database Scalability:** For larger-scale production, consider migrating from SQLite to a more robust database server (e.g., PostgreSQL, SQL Server) and implement any advanced EF Core configurations as needed.
*   **EF Core Migrations:** Continue to use and manage database schema changes effectively using EF Core migrations.
*   **API Integration Tests:** Ensure all API integration tests are passing and expand coverage.
*   **Frontend Test Coverage:** Add more comprehensive unit and integration tests for the frontend components, services, and NgRx store.
*   **Error Handling:** Enhance error handling consistently across both backend and frontend, providing user-friendly feedback.
*   **UI/UX:** Iteratively improve the user interface and user experience based on feedback and best practices.
*   **Security:** Implement further security measures (e.g., more granular input validation, rate limiting at the gateway, HTTPS enforcement in production).
*   **Deployment:** Create robust build pipelines and deployment scripts for various environments.

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

