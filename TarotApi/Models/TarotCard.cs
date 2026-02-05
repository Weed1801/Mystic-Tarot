namespace TarotApi.Models;

public class TarotCard
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Suit { get; set; } = string.Empty; // e.g., "Major", "Cups"
    public string ImageUrl { get; set; } = string.Empty;
    public string UprightKeywords { get; set; } = string.Empty;
    public string ReversedKeywords { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty; // Full description
}
