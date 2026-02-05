using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TarotApi.Data;
using TarotApi.Models;

namespace TarotApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CardsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TarotCard>>> GetCards()
    {
        try 
        {
            return await _context.TarotCards.ToListAsync();
        }
        catch (Exception ex)
        {
            // Log the error (optional: inject ILogger)
            Console.WriteLine($"Error fetching cards: {ex.Message}");
            return StatusCode(500, "Internal Server Error: Unable to fetch cards.");
        }
    }
}
