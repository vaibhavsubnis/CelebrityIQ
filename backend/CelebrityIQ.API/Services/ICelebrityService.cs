using CelebrityIQ.API.Models;

namespace CelebrityIQ.API.Services;

public interface ICelebrityService
{
    Task<List<Celebrity>> GetAllAsync();
    Task<Celebrity?> GetByIdAsync(string id);
    Task<Celebrity> CreateAsync(Celebrity celebrity);
    Task<bool> UpdateAsync(string id, Celebrity updatedCelebrity);
    Task<bool> DeleteAsync(string id);
    Task<long> GetCountAsync();
    Task<Celebrity?> GetByIndexAsync(int index);
}
