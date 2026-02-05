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
    private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"];
    }

    public async Task<string> GetReadingAsync(string userQuestion, List<TarotCard> cards)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Gemini API Key is missing.");
        }

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
        response.EnsureSuccessStatusCode();

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
            if (text.EndsWith("```"))
            {
                text = text.Substring(0, text.Length - 3);
            }
        }
        else if (text.StartsWith("```"))
        {
            text = text.Substring(3);
             if (text.EndsWith("```"))
            {
                text = text.Substring(0, text.Length - 3);
            }
        }

        return text.Trim();
    }
}
