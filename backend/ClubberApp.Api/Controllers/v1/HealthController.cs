using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClubberApp.Infrastructure.Persistence;
using ClubberApp.Infrastructure;
using ClubberApp.Application.Interfaces.Services;

namespace ClubberApp.Api.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IHealthCheckService _healthCheckService;
        public HealthController(IHealthCheckService healthCheckService)
        {
            _healthCheckService = healthCheckService;
        }
        /// <summary>
        /// Health check endpoint for monitoring.
        /// </summary>
        /// <returns>API health status.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var dbHealthy = await _healthCheckService.IsDatabaseHealthyAsync();
            if (dbHealthy)
                return Ok(new { status = "Healthy", db = "Connected" });
            else
                return StatusCode(503, new { status = "Unhealthy", db = "Disconnected" });
        }
    }
} 