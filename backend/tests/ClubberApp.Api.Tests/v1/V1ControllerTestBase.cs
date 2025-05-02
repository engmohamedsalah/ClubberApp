using System.Net.Http;

namespace ClubberApp.Api.Tests.v1;

public abstract class V1ControllerTestBase : IClassFixture<CustomWebApplicationFactory<Program>>
{
    protected readonly HttpClient _client;
    protected readonly CustomWebApplicationFactory<Program> _factory;
    protected const string ApiBase = "/api/v1";

    protected V1ControllerTestBase(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }
} 