using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CelebrityIQ.API.Models;

public class Celebrity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("dateOfBirth")]
    public DateTime DateOfBirth { get; set; }

    [BsonElement("nationality")]
    public string Nationality { get; set; } = null!;

    [BsonElement("fieldOfExpertise")]
    public string FieldOfExpertise { get; set; } = null!;

    [BsonElement("imageUrl")]
    public string ImageUrl { get; set; } = null!;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
