using System;

namespace TarotApi.Models;

public class ReadingCard
{
    public int Id { get; set; }
    public Guid SessionId { get; set; }
    public ReadingSession? Session { get; set; }
    
    public int CardId { get; set; }
    public TarotCard? Card { get; set; }
    
    public string Position { get; set; } = string.Empty; // e.g., "Past", "Present", "Future"
    public bool IsReversed { get; set; }
}
