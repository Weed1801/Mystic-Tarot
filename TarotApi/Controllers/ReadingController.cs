using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using TarotApi.Data;
using TarotApi.DTOs;
using TarotApi.Models;
using TarotApi.Services;

namespace TarotApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IGeminiService _geminiService;

    public ReadingController(AppDbContext context, IGeminiService geminiService)
    {
        _context = context;
        _geminiService = geminiService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReading([FromBody] ReadingRequest request)
    {
        if (request.SelectedCardIds.Count != 3)
        {
            return BadRequest("Please select exactly 3 cards for a Past, Present, Future reading.");
        }

        // 1. Retrieve Cards
        var cards = await _context.TarotCards
            .Where(c => request.SelectedCardIds.Contains(c.Id))
            .ToListAsync();

        if (cards.Count != 3)
        {
            return BadRequest("Invalid card IDs provided. Some cards were not found.");
        }

        // Ensure order matches request if important, or just pass as set. 
        // Logic: assume order in ID list maps to Positions [Past, Present, Future] logic in Gemini Service is generic
        // but for saving we might want to be specific.
        // For simplicity, we just pass the list.

        // 2. Call Gemini Service
        string rawResult;
        try
        {
            rawResult = await _geminiService.GetReadingAsync(request.Question, cards);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error contacting AI service: {ex.Message}");
        }

        // 3. Parse Result
        ReadingResultJson parsedResult;
        try 
        {
             parsedResult = JsonSerializer.Deserialize<ReadingResultJson>(rawResult, new JsonSerializerOptions
             {
                 PropertyNameCaseInsensitive = true
             }) ?? new ReadingResultJson();
        }
        catch
        {
             // Fallback if JSON parsing fails
             parsedResult = new ReadingResultJson { FinalAdvice = rawResult };
        }


        // 4. Save Session
        var session = new ReadingSession
        {
            Id = Guid.NewGuid(),
            UserQuestion = request.Question,
            ReadingType = "ThreeCardSpread",
            CreatedAt = DateTime.UtcNow
        };

        _context.ReadingSessions.Add(session);

        // 5. Save Reading Cards
        // Assuming order: 0 = Past, 1 = Present, 2 = Future based on input array order, 
        // BUT the DB cards query might return in any order.
        // Let's resolve order by matching with request IDs
        var orderedCards = request.SelectedCardIds
            .Select(id => cards.First(c => c.Id == id))
            .ToList();

        var positions = new[] { "Past", "Present", "Future" };

        for (int i = 0; i < 3; i++)
        {
            _context.ReadingCards.Add(new ReadingCard
            {
                SessionId = session.Id,
                CardId = orderedCards[i].Id,
                Position = positions[i],
                IsReversed = false // Simplified for now
            });
        }

        await _context.SaveChangesAsync();

        // 6. Return Response
        return Ok(new ReadingResponse
        {
            SessionId = session.Id,
            PastAnalysis = parsedResult.PastAnalysis,
            PresentAnalysis = parsedResult.PresentAnalysis,
            FutureAnalysis = parsedResult.FutureAnalysis,
            FinalAdvice = parsedResult.FinalAdvice,
            Cards = orderedCards.Select((c, i) => new ReadingCardDto 
            {
                Id = c.Id,
                Name = c.Name,
                ImageUrl = c.ImageUrl,
                Position = positions[i],
                IsReversed = false
            }).ToList()
        });
    }
    
    // Internal class for JSON deserialization
    private class ReadingResultJson
    {
        [JsonPropertyName("past_analysis")]
        public string PastAnalysis { get; set; } = "";
        
        [JsonPropertyName("present_analysis")]
        public string PresentAnalysis { get; set; } = "";
        
        [JsonPropertyName("future_analysis")]
        public string FutureAnalysis { get; set; } = "";
        
        [JsonPropertyName("final_advice")]
        public string FinalAdvice { get; set; } = "";
    }
}
