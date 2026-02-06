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
        try
        {
            Console.WriteLine($"Received reading request for question: {request.Question ?? "Empty"}");

            if (request.SelectedCardIds == null || request.SelectedCardIds.Count != 3)
            {
                Console.WriteLine($"Invalid Card Count: {request.SelectedCardIds?.Count}");
                return BadRequest("Please select exactly 3 cards for a Past, Present, Future reading.");
            }

            // 1. Retrieve Cards
            var cards = await _context.TarotCards
                .Where(c => request.SelectedCardIds.Contains(c.Id))
                .ToListAsync();

            if (cards.Count != 3)
            {
                Console.WriteLine($"Cards not found in DB. Requested: {string.Join(",", request.SelectedCardIds)}. Found: {cards.Count}");
                return BadRequest("Invalid card IDs provided. Some cards were not found.");
            }

            // 2. Call Gemini Service
            string rawResult;
            try
            {
                rawResult = await _geminiService.GetReadingAsync(request.Question, cards);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini Service CRITICAL FAIL: {ex}");
                // Return specific error to frontend so user knows it's an AI connection issue
                return StatusCode(503, $"AI Service Unavailable: {ex.Message}");
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
            catch (Exception jsonEx)
            {
                 Console.WriteLine($"JSON Parse Error: {jsonEx.Message}. Raw: {rawResult}");
                 // Fallback if JSON parsing fails but we have text
                 parsedResult = new ReadingResultJson { FinalAdvice = rawResult };
            }

            // 4. Save Session
            var session = new ReadingSession
            {
                Id = Guid.NewGuid(),
                UserQuestion = request.Question,
                ReadingType = "ThreeCardSpread",
                CreatedAt = DateTime.UtcNow,
                // Assign the parsed analysis to the entity
                PastAnalysis = parsedResult.PastAnalysis ?? "",
                PresentAnalysis = parsedResult.PresentAnalysis ?? "",
                FutureAnalysis = parsedResult.FutureAnalysis ?? "",
                FinalAdvice = parsedResult.FinalAdvice ?? ""
            };

            _context.ReadingSessions.Add(session);

            // 5. Save Reading Cards
            var orderedCards = request.SelectedCardIds
                .Select(id => cards.First(c => c.Id == id)) // This could fail if duplicates exist in request but not in DB list? No, checked count.
                .ToList();

            var positions = new[] { "Past", "Present", "Future" };

            for (int i = 0; i < 3; i++)
            {
                _context.ReadingCards.Add(new ReadingCard
                {
                    SessionId = session.Id,
                    CardId = orderedCards[i].Id,
                    Position = positions[i],
                    IsReversed = false 
                });
            }

            try 
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                Console.WriteLine($"Database Update Error: {innerMessage}");
                // Log the full stack trace for deep debugging if needed
                Console.WriteLine(dbEx.ToString());
                throw; // Re-throw to be caught by the outer catch block which returns 500
            }

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
        catch (Exception ex)
        {
            Console.WriteLine($"CONTROLLER ERROR: {ex.GetType().Name} - {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            if (ex.InnerException != null) Console.WriteLine($"Inner: {ex.InnerException.Message}");
            return StatusCode(500, "An internal server error occurred while processing your reading.");
        }
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
