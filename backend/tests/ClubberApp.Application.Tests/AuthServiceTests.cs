using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Interfaces;
using ClubberApp.Application.Interfaces.Repositories;
using ClubberApp.Application.Services;
using ClubberApp.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace ClubberApp.Application.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockConfiguration = new Mock<IConfiguration>();

        // Setup UnitOfWork to return the mock UserRepository
        _mockUnitOfWork.Setup(uow => uow.UserRepository).Returns(_mockUserRepository.Object);

        // Setup configuration for JWT under "JwtSettings" to match AuthService
        var jwtSettingsSection = new Mock<IConfigurationSection>();
        var jwtKeySection = new Mock<IConfigurationSection>();
        var jwtIssuerSection = new Mock<IConfigurationSection>();
        var jwtAudienceSection = new Mock<IConfigurationSection>();

        jwtKeySection.Setup(x => x.Value).Returns("TestSecretKeyWhichIsLongEnoughForHS256");
        jwtIssuerSection.Setup(x => x.Value).Returns("TestIssuer");
        jwtAudienceSection.Setup(x => x.Value).Returns("TestAudience");

        // Mock GetSection("JwtSettings")
        _mockConfiguration.Setup(c => c.GetSection("JwtSettings")).Returns(jwtSettingsSection.Object);

        // Mock GetSection calls within JwtSettings
        jwtSettingsSection.Setup(s => s.GetSection("Key")).Returns(jwtKeySection.Object);
        jwtSettingsSection.Setup(s => s.GetSection("Issuer")).Returns(jwtIssuerSection.Object);
        jwtSettingsSection.Setup(s => s.GetSection("Audience")).Returns(jwtAudienceSection.Object);

        // Mock direct access via indexer as well, as AuthService uses it
        jwtSettingsSection.Setup(s => s["Key"]).Returns("TestSecretKeyWhichIsLongEnoughForHS256");
        jwtSettingsSection.Setup(s => s["Issuer"]).Returns("TestIssuer");
        jwtSettingsSection.Setup(s => s["Audience"]).Returns("TestAudience");


        _authService = new AuthService(_mockUnitOfWork.Object, _mockMapper.Object, _mockConfiguration.Object);

        // Mock Mapper for User -> UserDto
        _mockMapper.Setup(m => m.Map<UserDto>(It.IsAny<User>()))
                   .Returns((User source) => new UserDto { Id = source.Id, Username = source.Username });
        // Mock Mapper for RegisterDto -> User
        _mockMapper.Setup(m => m.Map<User>(It.IsAny<RegisterDto>()))
                   .Returns((RegisterDto source) => new User { Username = source.Username });

    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnSuccess_WhenUsernameIsUnique()
    {
        // Arrange
        var registerDto = new RegisterDto { Username = "newuser", Password = "password" };
        var user = new User { Id = Guid.NewGuid(), Username = registerDto.Username };

        // Use GetUserByUsernameAsync and return null to simulate username not found
        _mockUserRepository.Setup(repo => repo.GetUserByUsernameAsync(registerDto.Username))
                           .ReturnsAsync((User?)null);
        _mockMapper.Setup(m => m.Map<User>(registerDto)).Returns(user);
        _mockUserRepository.Setup(repo => repo.AddAsync(user)).Returns(Task.CompletedTask);
        // Use SaveChangesAsync
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1); // Simulate successful save

        // Act
        var result = await _authService.RegisterAsync(registerDto);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Registration successful.", result.Message); // Updated message
        Assert.NotNull(result.Token);
        Assert.NotNull(result.User);
        Assert.Equal(user.Username, result.User.Username);
        _mockUserRepository.Verify(repo => repo.AddAsync(It.Is<User>(u => u.Username == registerDto.Username)), Times.Once);
        // Verify SaveChangesAsync
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnFailure_WhenUsernameExists()
    {
        // Arrange
        var registerDto = new RegisterDto { Username = "existinguser", Password = "password" };
        var existingUser = new User { Id = Guid.NewGuid(), Username = registerDto.Username };

        // Use GetUserByUsernameAsync and return the existing user
        _mockUserRepository.Setup(repo => repo.GetUserByUsernameAsync(registerDto.Username))
                           .ReturnsAsync(existingUser);

        // Act
        var result = await _authService.RegisterAsync(registerDto);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("Username already exists.", result.Message);
        _mockUserRepository.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Never);
        // Verify SaveChangesAsync was not called
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var loginDto = new LoginDto { Username = "testuser", Password = "password" };
        // Hash the password as the service would
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(loginDto.Password);
        var user = new User { Id = Guid.NewGuid(), Username = loginDto.Username, PasswordHash = hashedPassword };

        // Use GetUserByUsernameAsync and return the user
        _mockUserRepository.Setup(repo => repo.GetUserByUsernameAsync(loginDto.Username))
                           .ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Token);
        Assert.NotEmpty(result.Token);
        Assert.NotNull(result.User);
        Assert.Equal(user.Username, result.User.Username);
        Assert.Equal("Login successful.", result.Message);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnFailure_WhenUserNotFound()
    {
        // Arrange
        var loginDto = new LoginDto { Username = "nonexistent", Password = "password" };

        // Use GetUserByUsernameAsync and return null
        _mockUserRepository.Setup(repo => repo.GetUserByUsernameAsync(loginDto.Username))
                           .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Null(result.Token);
        Assert.Null(result.User);
        Assert.Equal("Invalid username or password.", result.Message);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnFailure_WhenPasswordIsIncorrect()
    {
        // Arrange
        var loginDto = new LoginDto { Username = "testuser", Password = "wrongpassword" };
        string correctHashedPassword = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        var user = new User { Id = Guid.NewGuid(), Username = loginDto.Username, PasswordHash = correctHashedPassword };

        // Use GetUserByUsernameAsync and return the user
        _mockUserRepository.Setup(repo => repo.GetUserByUsernameAsync(loginDto.Username))
                           .ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Null(result.Token);
        Assert.Null(result.User);
        Assert.Equal("Invalid username or password.", result.Message);
    }
}

