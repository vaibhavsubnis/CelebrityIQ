using CelebrityIQ.API.Models;
using CelebrityIQ.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CelebrityIQ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CelebritiesController : ControllerBase
{
    private readonly ICelebrityService _celebrityService;

    public CelebritiesController(ICelebrityService celebrityService)
    {
        _celebrityService = celebrityService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Celebrity>>> GetAll()
    {
        var celebrities = await _celebrityService.GetAllAsync();
        return Ok(celebrities);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Celebrity>> GetById(string id)
    {
        var celebrity = await _celebrityService.GetByIdAsync(id);
        if (celebrity == null)
        {
            return NotFound(new { error = new { code = "NOT_FOUND", message = "Celebrity not found" } });
        }
        return Ok(celebrity);
    }

    [HttpPost]
    public async Task<ActionResult<Celebrity>> Create([FromBody] Celebrity celebrity)
    {
        if (string.IsNullOrWhiteSpace(celebrity.Name))
        {
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Name is required" } });
        }

        if (string.IsNullOrWhiteSpace(celebrity.ImageUrl))
        {
            return BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Image URL is required" } });
        }

        var created = await _celebrityService.CreateAsync(celebrity);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] Celebrity celebrity)
    {
        var existing = await _celebrityService.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound(new { error = new { code = "NOT_FOUND", message = "Celebrity not found" } });
        }

        celebrity.Id = id;
        celebrity.CreatedAt = existing.CreatedAt;
        var updated = await _celebrityService.UpdateAsync(id, celebrity);

        if (!updated)
        {
            return StatusCode(500, new { error = new { code = "UPDATE_FAILED", message = "Failed to update celebrity" } });
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var existing = await _celebrityService.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound(new { error = new { code = "NOT_FOUND", message = "Celebrity not found" } });
        }

        var deleted = await _celebrityService.DeleteAsync(id);
        if (!deleted)
        {
            return StatusCode(500, new { error = new { code = "DELETE_FAILED", message = "Failed to delete celebrity" } });
        }

        return NoContent();
    }
}
