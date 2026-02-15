namespace OpenAIServiceGpt4o.Models
{
  public class ChatRequest
  {
    public List<ChatMessageDto> Messages { get; set; } = new();
    /// <summary>When provided, appends to this chat; otherwise a new chat is created.</summary>
    public int? ChatId { get; set; }
  }
}
