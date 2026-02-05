using System.Collections.Generic;

namespace TarotApi.DTOs;

public class ReadingRequest
{
    public string Question { get; set; } = string.Empty;
    public List<int> SelectedCardIds { get; set; } = new();
}

public class ReadingResponse
{
    public Guid SessionId { get; set; }
    public string PastAnalysis { get; set; } = string.Empty;
    public string PresentAnalysis { get; set; } = string.Empty;
    public string FutureAnalysis { get; set; } = string.Empty;
    public string FinalAdvice { get; set; } = string.Empty;
    public List<ReadingCardDto> Cards { get; set; } = new();
}

public class ReadingCardDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public bool IsReversed { get; set; }
}
