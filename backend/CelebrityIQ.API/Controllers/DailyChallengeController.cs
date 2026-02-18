using CelebrityIQ.API.Models;
using CelebrityIQ.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CelebrityIQ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyChallengeController : ControllerBase
{
    private readonly IDailyChallengeService _dailyChallengeService;

    public DailyChallengeController(IDailyChallengeService dailyChallengeService)
    {
        _dailyChallengeService = dailyChallengeService;
    }

    [HttpGet]
    public async Task<ActionResult<DailyChallengeResponse>> GetTodaysChallenge()
    {
        var challenge = await _dailyChallengeService.GetTodaysChallengeAsync();
        if (challenge == null)
        {
            return NotFound(new { error = new { code = "NO_CHALLENGE", message = "No celebrities available. Add celebrities via the admin panel first." } });
        }
        return Ok(challenge);
    }

    [HttpPost("guess")]
    public async Task<ActionResult<GuessResponse>> SubmitGuess([FromBody] GuessRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Guess))
        {
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Guess is required" } });
        }

        if (string.IsNullOrWhiteSpace(request.CelebrityId))
        {
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Celebrity ID is required" } });
        }

        var result = await _dailyChallengeService.CheckGuessAsync(request);
        return Ok(result);
    }
}
