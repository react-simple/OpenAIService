namespace OpenAIServiceGpt4o.Models
{
  public class ChatResponse
  {
    public Guid ChatId { get; set; }
    public List<ChatMessageDto> Messages { get; set; } = new();
  }
}
