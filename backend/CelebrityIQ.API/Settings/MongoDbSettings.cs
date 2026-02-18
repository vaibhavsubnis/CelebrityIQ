namespace CelebrityIQ.API.Settings;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string CelebritiesCollectionName { get; set; } = null!;
    public string DailyChallengesCollectionName { get; set; } = null!;
}
