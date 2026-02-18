namespace CelebrityIQ.API.Models;

public class GuessRequest
{
    public string CelebrityId { get; set; } = null!;
    public string Guess { get; set; } = null!;
    public int TilesRevealed { get; set; }
}

public class GuessResponse
{
    public bool Correct { get; set; }
    public int PointsAwarded { get; set; }
    public string? CelebrityName { get; set; }
    public string? Nationality { get; set; }
    public string? FieldOfExpertise { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public bool GameOver { get; set; }
}

public class DailyChallengeResponse
{
    public string ChallengeId { get; set; } = null!;
    public string CelebrityId { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public int InitialTileIndex { get; set; }
    public string Date { get; set; } = null!;
}
