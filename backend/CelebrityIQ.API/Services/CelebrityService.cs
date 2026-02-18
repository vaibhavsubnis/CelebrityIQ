using CelebrityIQ.API.Models;
using CelebrityIQ.API.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CelebrityIQ.API.Services;

public class CelebrityService
{
    private readonly IMongoCollection<Celebrity> _celebrities;

    public CelebrityService(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _celebrities = database.GetCollection<Celebrity>(settings.Value.CelebritiesCollectionName);
    }

    public async Task<List<Celebrity>> GetAllAsync() =>
        await _celebrities.Find(_ => true)
            .SortBy(c => c.Name)
            .ToListAsync();

    public async Task<Celebrity?> GetByIdAsync(string id) =>
        await _celebrities.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task<Celebrity> CreateAsync(Celebrity celebrity)
    {
        celebrity.CreatedAt = DateTime.UtcNow;
        celebrity.UpdatedAt = DateTime.UtcNow;
        await _celebrities.InsertOneAsync(celebrity);
        return celebrity;
    }

    public async Task<bool> UpdateAsync(string id, Celebrity updatedCelebrity)
    {
        updatedCelebrity.UpdatedAt = DateTime.UtcNow;
        var result = await _celebrities.ReplaceOneAsync(
            c => c.Id == id,
            updatedCelebrity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _celebrities.DeleteOneAsync(c => c.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<long> GetCountAsync() =>
        await _celebrities.CountDocumentsAsync(_ => true);

    public async Task<Celebrity?> GetByIndexAsync(int index) =>
        await _celebrities.Find(_ => true)
            .SortBy(c => c.Id)
            .Skip(index)
            .Limit(1)
            .FirstOrDefaultAsync();
}
