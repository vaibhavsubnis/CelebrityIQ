using CelebrityIQ.API.Controllers;
using CelebrityIQ.API.Models;
using CelebrityIQ.API.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CelebrityIQ.Tests.Controllers;

public class CelebritiesControllerTests
{
    private readonly Mock<ICelebrityService> _mockService;
    private readonly CelebritiesController _controller;

    public CelebritiesControllerTests()
    {
        _mockService = new Mock<ICelebrityService>();
        _controller = new CelebritiesController(_mockService.Object);
    }

    // ──────────────────────────────────────────────
    // GET /api/celebrities
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GetAll_ReturnsOk_WithListOfCelebrities()
    {
        var celebrities = new List<Celebrity>
        {
            MakeCelebrity("1", "Tom Hanks"),
            MakeCelebrity("2", "Meryl Streep"),
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(celebrities);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<List<Celebrity>>(ok.Value);
        Assert.Equal(2, returned.Count);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithEmptyList_WhenNoCelebrities()
    {
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<Celebrity>());

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<List<Celebrity>>(ok.Value);
        Assert.Empty(returned);
    }

    // ──────────────────────────────────────────────
    // GET /api/celebrities/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GetById_ReturnsOk_WhenCelebrityExists()
    {
        var celebrity = MakeCelebrity("abc", "Cate Blanchett");
        _mockService.Setup(s => s.GetByIdAsync("abc")).ReturnsAsync(celebrity);

        var result = await _controller.GetById("abc");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<Celebrity>(ok.Value);
        Assert.Equal("Cate Blanchett", returned.Name);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenCelebrityDoesNotExist()
    {
        _mockService.Setup(s => s.GetByIdAsync("missing")).ReturnsAsync((Celebrity?)null);

        var result = await _controller.GetById("missing");

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    // ──────────────────────────────────────────────
    // POST /api/celebrities
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Create_ReturnsCreated_WithValidCelebrity()
    {
        var celebrity = MakeCelebrity(null, "Denzel Washington");
        var created = MakeCelebrity("new-id", "Denzel Washington");
        _mockService.Setup(s => s.CreateAsync(celebrity)).ReturnsAsync(created);

        var result = await _controller.Create(celebrity);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(201, createdResult.StatusCode);
        var returned = Assert.IsType<Celebrity>(createdResult.Value);
        Assert.Equal("new-id", returned.Id);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenNameIsEmpty()
    {
        var celebrity = MakeCelebrity(null, "");

        var result = await _controller.Create(celebrity);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenImageUrlIsEmpty()
    {
        var celebrity = MakeCelebrity(null, "Valid Name");
        celebrity.ImageUrl = "";

        var result = await _controller.Create(celebrity);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    // ──────────────────────────────────────────────
    // PUT /api/celebrities/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Update_ReturnsNoContent_WhenSuccessful()
    {
        var existing = MakeCelebrity("id1", "Old Name");
        var updated = MakeCelebrity("id1", "New Name");
        _mockService.Setup(s => s.GetByIdAsync("id1")).ReturnsAsync(existing);
        _mockService.Setup(s => s.UpdateAsync("id1", It.IsAny<Celebrity>())).ReturnsAsync(true);

        var result = await _controller.Update("id1", updated);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenCelebrityDoesNotExist()
    {
        _mockService.Setup(s => s.GetByIdAsync("nope")).ReturnsAsync((Celebrity?)null);

        var result = await _controller.Update("nope", MakeCelebrity("nope", "Someone"));

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Update_Returns500_WhenDatabaseUpdateFails()
    {
        var existing = MakeCelebrity("id1", "Name");
        _mockService.Setup(s => s.GetByIdAsync("id1")).ReturnsAsync(existing);
        _mockService.Setup(s => s.UpdateAsync("id1", It.IsAny<Celebrity>())).ReturnsAsync(false);

        var result = await _controller.Update("id1", existing);

        var status = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, status.StatusCode);
    }

    // ──────────────────────────────────────────────
    // DELETE /api/celebrities/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        var existing = MakeCelebrity("del-1", "Someone");
        _mockService.Setup(s => s.GetByIdAsync("del-1")).ReturnsAsync(existing);
        _mockService.Setup(s => s.DeleteAsync("del-1")).ReturnsAsync(true);

        var result = await _controller.Delete("del-1");

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenCelebrityDoesNotExist()
    {
        _mockService.Setup(s => s.GetByIdAsync("ghost")).ReturnsAsync((Celebrity?)null);

        var result = await _controller.Delete("ghost");

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Delete_Returns500_WhenDatabaseDeleteFails()
    {
        var existing = MakeCelebrity("id1", "Name");
        _mockService.Setup(s => s.GetByIdAsync("id1")).ReturnsAsync(existing);
        _mockService.Setup(s => s.DeleteAsync("id1")).ReturnsAsync(false);

        var result = await _controller.Delete("id1");

        var status = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, status.StatusCode);
    }

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

    private static Celebrity MakeCelebrity(string? id, string name) => new()
    {
        Id = id,
        Name = name,
        Nationality = "American",
        FieldOfExpertise = "Acting",
        DateOfBirth = new DateTime(1970, 1, 1),
        ImageUrl = "https://example.com/photo.jpg",
    };
}
