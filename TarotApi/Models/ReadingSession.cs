using System;
using System.Collections.Generic;

namespace TarotApi.Models;

public class ReadingSession
{
    public Guid Id { get; set; }
    public string UserQuestion { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string ReadingType { get; set; } = string.Empty; // e.g., "ThreeCardSpread"
    
    // Store the analysis results directly in the session
    public string PastAnalysis { get; set; } = string.Empty;
    public string PresentAnalysis { get; set; } = string.Empty;
    public string FutureAnalysis { get; set; } = string.Empty;
    public string FinalAdvice { get; set; } = string.Empty;
    
    // Navigation property
    public List<ReadingCard> ReadingCards { get; set; } = new();
}
