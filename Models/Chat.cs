namespace OpenAIServiceGpt4o.Models
{
  /// <summary>Chat entity. ChatId = Guid.Empty when unsaved.</summary>
  public class Chat
  {
    public Guid ChatId { get; set; }
    public string Email { get; set; } = "";
    public DateTime ChatStartDate { get; set; }
    public DateTime ChatUpdate { get; set; }
    public string Title { get; set; } = "";
    public ChatMessageDto[]? Content { get; set; }
  }
}
