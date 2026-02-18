using CelebrityIQ.API.Models;

namespace CelebrityIQ.API.Services;

public interface IDailyChallengeService
{
    Task<DailyChallengeResponse?> GetTodaysChallengeAsync();
    Task<GuessResponse> CheckGuessAsync(GuessRequest request);
}
