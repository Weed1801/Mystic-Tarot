using System;
using System.Collections.Generic;

namespace TarotApi.Models;

public class ReadingSession
{
    public Guid Id { get; set; }
    public string UserQuestion { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string ReadingType { get; set; } = string.Empty; // e.g., "ThreeCardSpread"
    
    // Navigation property
    public List<ReadingCard> ReadingCards { get; set; } = new();
}
