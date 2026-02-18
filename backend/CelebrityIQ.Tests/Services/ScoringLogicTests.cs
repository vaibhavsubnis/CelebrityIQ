using CelebrityIQ.API.Services;
using Xunit;

namespace CelebrityIQ.Tests.Services;

/// <summary>
/// Unit tests for the pure scoring and selection functions extracted from DailyChallengeService.
/// These tests require no database and run in isolation.
/// </summary>
public class ScoringLogicTests
{
    // ──────────────────────────────────────────────
    // CalculatePoints
    // ──────────────────────────────────────────────

    [Theory]
    [InlineData(1, 5)]
    [InlineData(2, 4)]
    [InlineData(3, 3)]
    [InlineData(4, 2)]
    [InlineData(5, 1)]
    [InlineData(6, 0)]
    public void CalculatePoints_ReturnsCorrectPointsForEachRound(int tilesRevealed, int expectedPoints)
    {
        var points = DailyChallengeService.CalculatePoints(tilesRevealed);
        Assert.Equal(expectedPoints, points);
    }

    [Fact]
    public void CalculatePoints_NeverReturnsBelowZero()
    {
        // Even if more than 6 tiles were somehow revealed the score floors at 0
        var points = DailyChallengeService.CalculatePoints(7);
        Assert.Equal(0, points);
    }

    [Fact]
    public void CalculatePoints_ZeroTilesRevealed_ReturnsSix()
    {
        // Edge case: if called before any tile is revealed
        var points = DailyChallengeService.CalculatePoints(0);
        Assert.Equal(6, points);
    }

    // ──────────────────────────────────────────────
    // SelectForDate — determinism and bounds
    // ──────────────────────────────────────────────

    [Fact]
    public void SelectForDate_IsDeterministicForTheSameDate()
    {
        var date = new DateTime(2026, 1, 15);
        const int count = 10;

        var (index1, tile1) = DailyChallengeService.SelectForDate(date, count);
        var (index2, tile2) = DailyChallengeService.SelectForDate(date, count);

        Assert.Equal(index1, index2);
        Assert.Equal(tile1, tile2);
    }

    [Fact]
    public void SelectForDate_CelebrityIndexIsWithinBounds()
    {
        var date = new DateTime(2026, 2, 18);
        const int count = 50;

        var (celebrityIndex, _) = DailyChallengeService.SelectForDate(date, count);

        Assert.InRange(celebrityIndex, 0, count - 1);
    }

    [Fact]
    public void SelectForDate_TileIndexIsWithinSixTiles()
    {
        var date = new DateTime(2026, 2, 18);
        const int count = 10;

        var (_, tileIndex) = DailyChallengeService.SelectForDate(date, count);

        Assert.InRange(tileIndex, 0, 5);
    }

    [Fact]
    public void SelectForDate_DifferentDatesGenerateDifferentSelections()
    {
        const int count = 100;
        var date1 = new DateTime(2026, 1, 1);
        var date2 = new DateTime(2026, 1, 2);

        var (index1, tile1) = DailyChallengeService.SelectForDate(date1, count);
        var (index2, tile2) = DailyChallengeService.SelectForDate(date2, count);

        // With 100 celebrities it's statistically unlikely both match; the seed formula differs
        Assert.False(index1 == index2 && tile1 == tile2,
            "Adjacent dates should produce different selections with a large enough pool.");
    }

    [Fact]
    public void SelectForDate_SingleCelebrity_AlwaysReturnsIndexZero()
    {
        const int count = 1;

        for (var day = 1; day <= 28; day++)
        {
            var date = new DateTime(2026, 1, day);
            var (celebrityIndex, _) = DailyChallengeService.SelectForDate(date, count);
            Assert.Equal(0, celebrityIndex);
        }
    }

    [Theory]
    [InlineData("2026-01-01")]
    [InlineData("2026-06-15")]
    [InlineData("2026-12-31")]
    public void SelectForDate_TileIndexIsAlwaysZToFive(string dateString)
    {
        var date = DateTime.Parse(dateString);

        for (var count = 1; count <= 200; count++)
        {
            var (_, tileIndex) = DailyChallengeService.SelectForDate(date, count);
            Assert.InRange(tileIndex, 0, 5);
        }
    }
}
