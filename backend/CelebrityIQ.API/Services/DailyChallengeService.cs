using CelebrityIQ.API.Models;
using CelebrityIQ.API.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CelebrityIQ.API.Services;

public class DailyChallengeService
{
    private readonly IMongoCollection<DailyChallenge> _challenges;
    private readonly CelebrityService _celebrityService;

    public DailyChallengeService(
        IOptions<MongoDbSettings> settings,
        CelebrityService celebrityService)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _challenges = database.GetCollection<DailyChallenge>(
            settings.Value.DailyChallengesCollectionName);
        _celebrityService = celebrityService;

        // Ensure unique index on date
        var indexKeys = Builders<DailyChallenge>.IndexKeys.Ascending(c => c.Date);
        var indexOptions = new CreateIndexOptions { Unique = true };
        _challenges.Indexes.CreateOne(
            new CreateIndexModel<DailyChallenge>(indexKeys, indexOptions));
    }

    public async Task<DailyChallengeResponse?> GetTodaysChallengeAsync()
    {
        var today = DateTime.UtcNow.Date;
        var challenge = await _challenges
            .Find(c => c.Date == today)
            .FirstOrDefaultAsync();

        if (challenge == null)
        {
            challenge = await CreateTodaysChallengeAsync(today);
            if (challenge == null) return null;
        }

        var celebrity = await _celebrityService.GetByIdAsync(challenge.CelebrityId);
        if (celebrity == null) return null;

        return new DailyChallengeResponse
        {
            ChallengeId = challenge.Id!,
            CelebrityId = celebrity.Id!,
            ImageUrl = celebrity.ImageUrl,
            InitialTileIndex = challenge.InitialTileIndex,
            Date = today.ToString("yyyy-MM-dd")
        };
    }

    private async Task<DailyChallenge?> CreateTodaysChallengeAsync(DateTime today)
    {
        var count = await _celebrityService.GetCountAsync();
        if (count == 0) return null;

        // Deterministic selection based on date
        var seed = today.Year * 10000 + today.Month * 100 + today.Day;
        var random = new Random(seed);
        var celebrityIndex = random.Next((int)count);
        var tileIndex = random.Next(6);

        var celebrity = await _celebrityService.GetByIndexAsync(celebrityIndex);
        if (celebrity == null) return null;

        var challenge = new DailyChallenge
        {
            Date = today,
            CelebrityId = celebrity.Id!,
            InitialTileIndex = tileIndex,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await _challenges.InsertOneAsync(challenge);
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            // Another request already created today's challenge
            challenge = await _challenges
                .Find(c => c.Date == today)
                .FirstOrDefaultAsync();
        }

        return challenge;
    }

    public async Task<GuessResponse> CheckGuessAsync(GuessRequest request)
    {
        var celebrity = await _celebrityService.GetByIdAsync(request.CelebrityId);
        if (celebrity == null)
        {
            return new GuessResponse
            {
                Correct = false,
                PointsAwarded = 0,
                GameOver = true
            };
        }

        var isCorrect = string.Equals(
            celebrity.Name.Trim(),
            request.Guess.Trim(),
            StringComparison.OrdinalIgnoreCase);

        var maxPoints = 6 - request.TilesRevealed;
        var pointsAwarded = isCorrect ? Math.Max(0, maxPoints) : 0;
        var gameOver = isCorrect || request.TilesRevealed >= 6;

        return new GuessResponse
        {
            Correct = isCorrect,
            PointsAwarded = pointsAwarded,
            CelebrityName = gameOver ? celebrity.Name : null,
            Nationality = gameOver ? celebrity.Nationality : null,
            FieldOfExpertise = gameOver ? celebrity.FieldOfExpertise : null,
            DateOfBirth = gameOver ? celebrity.DateOfBirth : null,
            GameOver = gameOver
        };
    }
}
