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
Bạn là một Tarot Reader chuyên nghiệp, mang phong cách huyền bí, giọng điệu thấu cảm và sâu sắc.
Người dùng đang hỏi: '{userQuestion}'
Các lá bài đã rút được:
{cardDescriptions}

Nhiệm vụ của bạn:
1. Hãy dệt nên một câu chuyện mạch lạc, kết nối ý nghĩa của 3 lá bài (Quá khứ - Hiện tại - Tương lai) để trả lời câu hỏi của người dùng.
2. Đừng chỉ liệt kê ý nghĩa từng lá bài một cách rời rạc. Hãy phân tích sự tương tác giữa chúng.
3. Lời tiên tri cần CỤ THỂ, RÕ RÀNG, đi thẳng vào vấn đề, tránh nói chung chung nước đôi.
4. Đưa ra lời khuyên thiết thực giải quyết vấn đề của người dùng.

Yêu cầu định dạng:
Trả về kết quả CHỈ là chuỗi JSON hợp lệ (không bao gồm markdown code block ```json ... ```), với cấu trúc chính xác sau:
{{
  ""past_analysis"": ""[Phân tích lá bài quá khứ: Nguyên nhân sâu xa hoặc nền tảng của vấn đề]..."",
  ""present_analysis"": ""[Phân tích lá bài hiện tại: Tình hình thực tế, năng lượng chi phối, thuận lợi/khó khăn]..."",
  ""future_analysis"": ""[Phân tích lá bài tương lai: Xu hướng phát triển nếu đi theo đường hướng hiện tại]..."",
  ""final_advice"": ""[Lời khuyên tổng kết: Hành động cụ thể cần làm, thái độ cần có, hoặc thông điệp cốt lõi từ vũ trụ]...""
}}
";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new 
                {
                    maxOutputTokens = 2000,
                    temperature = 0.7
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

            past_analysis = $"Lá bài {cards[0].Name} xuất hiện ở vị trí Quá Khứ. Ý nghĩa: {cards[0].Meaning}. Điều này cho thấy những trải nghiệm đã qua đang ảnh hưởng mạnh mẽ đến bạn.",
            present_analysis = $"Tại vị trí Hiện Tại, {cards[1].Name} hiện diện. Thông điệp: {cards[1].Meaning}. Đây là năng lượng chủ đạo mà bạn cần lưu tâm ngay lúc này.",
            future_analysis = $"Lá bài {cards[2].Name} dự báo Tương Lai. Ý nghĩa: {cards[2].Meaning}. Hãy chuẩn bị tinh thần để đón nhận những thay đổi này.",
            final_advice = "Hiện tại kết nối với Vũ trụ (API) đang gián đoạn nên lời tiên tri chi tiết chưa thể gửi đến bạn. Hãy suy ngẫm về ý nghĩa của 3 lá bài trên, câu trả lời nằm trong chính trực giác của bạn."
        });
    }
}
