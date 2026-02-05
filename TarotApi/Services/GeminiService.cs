using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using TarotApi.Models;

namespace TarotApi.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    // Updated to gemini-2.0-flash as requested
    private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"];
    }

    public async Task<string> GetReadingAsync(string userQuestion, List<TarotCard> cards)
    {
        // Fail-safe: If API Key is missing or invalid, return a mystic placeholder to avoid crashing the user experience
        if (string.IsNullOrEmpty(_apiKey) || _apiKey.Length < 10)
        {
            Console.WriteLine("Warning: Gemini API Key is missing or invalid. Returning fallback prediction.");
            return GenerateFallbackReading(cards);
        }

        try 
        {
            var cardDescriptions = string.Join("\n", cards.Select((c, i) => 
                $"Card {i + 1}: {c.Name} ({c.UprightKeywords}) - Description: {c.Meaning}"));

            var prompt = $@"
You are a mystical, empathetic Tarot Reader speaking Vietnamese.
The user asks: '{userQuestion}'
The cards drawn are:
{cardDescriptions}

Weave a coherent story that answers the user's question. Do not just list definitions. Connect the cards (Past, Present, Future).
Return the response VALID JSON format strictly (no markdown code blocks) with the following structure:
{{
  ""past_analysis"": ""..."",
  ""present_analysis"": ""..."",
  ""future_analysis"": ""..."",
  ""final_advice"": ""...""
}}
";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            Console.WriteLine($"Sending request to Gemini... API Key length: {_apiKey.Length}");
            var response = await _httpClient.PostAsync($"{BaseUrl}?key={_apiKey}", content);
            Console.WriteLine($"Gemini Response Status: {response.StatusCode}");
            
            if (!response.IsSuccessStatusCode)
            {
                 var errorContent = await response.Content.ReadAsStringAsync();
                 Console.WriteLine($"Gemini API Error: {errorContent}");
                 return GenerateFallbackReading(cards);
            }
            
            // ... processing continues below (no change needed to parsing logic if successful)
            // But we need to make sure the original code flow is maintained or wrapped. 
            // Since we are replacing the top block, lets just return the response stream handling here or let it fall through?
            // The logic below this block in original file parses responseString. 
            // We need to return here only if fallback. If success, we continue.
            
            // Re-implement the rest here to be safe and clean since we are in a Replace Block
            var responseString = await response.Content.ReadAsStringAsync();
        
            using var doc = JsonDocument.Parse(responseString);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            // Gemini sometimes returns markdown code blocks ```json ... ```, strip them if present
            text = text.Trim();
            if (text.StartsWith("```json"))
            {
                text = text.Substring(7);
                if (text.EndsWith("```")) text = text.Substring(0, text.Length - 3);
            }
            else if (text.StartsWith("```"))
            {
                text = text.Substring(3);
                if (text.EndsWith("```")) text = text.Substring(0, text.Length - 3);
            }

            return text.Trim();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error contacting Gemini Service: {ex.Message}");
            return GenerateFallbackReading(cards); 
        }
    }

    private string GenerateFallbackReading(List<TarotCard> cards)
    {
        // Simple fallback JSON generator
        return JsonSerializer.Serialize(new 
        {
            past_analysis = $"Lá bài {cards[0].Name} cho thấy quá khứ của bạn gắn liền với {cards[0].UprightKeywords}. Các vì sao đang bị che khuất, nhưng năng lượng này rất rõ ràng.",
            present_analysis = $"Tại thời điểm này, {cards[1].Name} xuất hiện như một dấu hiệu của {cards[1].UprightKeywords}. Hãy chú ý đến trực giác của bạn.",
            future_analysis = $"Tương lai mang đến {cards[2].Name}. Đây là điềm báo về {cards[2].UprightKeywords}. Hãy chuẩn bị tinh thần đón nhận.",
            final_advice = "Hiện tại kết nối với Vũ trụ (API) đang gián đoạn. Hãy suy ngẫm về ý nghĩa của từng lá bài trên. Câu trả lời nằm trong chính bạn."
        });
    }
}
