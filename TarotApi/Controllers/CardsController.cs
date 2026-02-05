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
        return await _context.TarotCards.ToListAsync();
    }
}
