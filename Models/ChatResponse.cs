namespace OpenAIServiceGpt4o.Models
{
  public class ChatResponse
  {
    public int ChatId { get; set; }
    public List<ChatMessageDto> Messages { get; set; } = new();
  }
}
