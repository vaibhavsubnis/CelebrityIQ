using CelebrityIQ.API.Controllers;
using CelebrityIQ.API.Models;
using CelebrityIQ.API.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CelebrityIQ.Tests.Controllers;

public class DailyChallengeControllerTests
{
    private readonly Mock<IDailyChallengeService> _mockService;
    private readonly DailyChallengeController _controller;

    public DailyChallengeControllerTests()
    {
        _mockService = new Mock<IDailyChallengeService>();
        _controller = new DailyChallengeController(_mockService.Object);
    }

    // ──────────────────────────────────────────────
    // GET /api/dailychallenge
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GetTodaysChallenge_ReturnsOk_WithChallengeData()
    {
        var challenge = new DailyChallengeResponse
        {
            ChallengeId = "ch1",
            CelebrityId = "cel1",
            ImageUrl = "https://example.com/image.jpg",
            InitialTileIndex = 2,
            Date = "2026-02-18",
        };
        _mockService.Setup(s => s.GetTodaysChallengeAsync()).ReturnsAsync(challenge);

        var result = await _controller.GetTodaysChallenge();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<DailyChallengeResponse>(ok.Value);
        Assert.Equal("ch1", returned.ChallengeId);
        Assert.Equal(2, returned.InitialTileIndex);
    }

    [Fact]
    public async Task GetTodaysChallenge_ReturnsNotFound_WhenNoCelebritiesExist()
    {
        _mockService.Setup(s => s.GetTodaysChallengeAsync()).ReturnsAsync((DailyChallengeResponse?)null);

        var result = await _controller.GetTodaysChallenge();

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    // ──────────────────────────────────────────────
    // POST /api/dailychallenge/guess
    // ──────────────────────────────────────────────

    [Fact]
    public async Task SubmitGuess_ReturnsOk_WhenGuessIsCorrect()
    {
        var request = new GuessRequest
        {
            CelebrityId = "cel1",
            Guess = "Tom Hanks",
            TilesRevealed = 2,
        };
        var response = new GuessResponse
        {
            Correct = true,
            PointsAwarded = 4,
            CelebrityName = "Tom Hanks",
            GameOver = true,
        };
        _mockService.Setup(s => s.CheckGuessAsync(request)).ReturnsAsync(response);

        var result = await _controller.SubmitGuess(request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<GuessResponse>(ok.Value);
        Assert.True(returned.Correct);
        Assert.Equal(4, returned.PointsAwarded);
    }

    [Fact]
    public async Task SubmitGuess_ReturnsOk_WhenGuessIsWrong()
    {
        var request = new GuessRequest
        {
            CelebrityId = "cel1",
            Guess = "Wrong Name",
            TilesRevealed = 1,
        };
        var response = new GuessResponse
        {
            Correct = false,
            PointsAwarded = 0,
            GameOver = false,
        };
        _mockService.Setup(s => s.CheckGuessAsync(request)).ReturnsAsync(response);

        var result = await _controller.SubmitGuess(request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<GuessResponse>(ok.Value);
        Assert.False(returned.Correct);
        Assert.False(returned.GameOver);
    }

    [Fact]
    public async Task SubmitGuess_ReturnsBadRequest_WhenGuessIsEmpty()
    {
        var request = new GuessRequest
        {
            CelebrityId = "cel1",
            Guess = "",
            TilesRevealed = 1,
        };

        var result = await _controller.SubmitGuess(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
        _mockService.Verify(s => s.CheckGuessAsync(It.IsAny<GuessRequest>()), Times.Never);
    }

    [Fact]
    public async Task SubmitGuess_ReturnsBadRequest_WhenGuessIsWhitespace()
    {
        var request = new GuessRequest
        {
            CelebrityId = "cel1",
            Guess = "   ",
            TilesRevealed = 1,
        };

        var result = await _controller.SubmitGuess(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SubmitGuess_ReturnsBadRequest_WhenCelebrityIdIsEmpty()
    {
        var request = new GuessRequest
        {
            CelebrityId = "",
            Guess = "Tom Hanks",
            TilesRevealed = 1,
        };

        var result = await _controller.SubmitGuess(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
        _mockService.Verify(s => s.CheckGuessAsync(It.IsAny<GuessRequest>()), Times.Never);
    }

    [Fact]
    public async Task SubmitGuess_ReturnsOk_WithGameOverWhenAllTilesRevealed()
    {
        var request = new GuessRequest
        {
            CelebrityId = "cel1",
            Guess = "Wrong Name",
            TilesRevealed = 6,
        };
        var response = new GuessResponse
        {
            Correct = false,
            PointsAwarded = 0,
            CelebrityName = "Tom Hanks",
            GameOver = true,
        };
        _mockService.Setup(s => s.CheckGuessAsync(request)).ReturnsAsync(response);

        var result = await _controller.SubmitGuess(request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<GuessResponse>(ok.Value);
        Assert.True(returned.GameOver);
        Assert.Equal(0, returned.PointsAwarded);
    }
}
