using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CelebrityIQ.API.Models;

public class DailyChallenge
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("date")]
    public DateTime Date { get; set; }

    [BsonElement("celebrityId")]
    public string CelebrityId { get; set; } = null!;

    [BsonElement("initialTileIndex")]
    public int InitialTileIndex { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
