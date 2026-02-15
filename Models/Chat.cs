namespace OpenAIServiceGpt4o.Models
{
  /// <summary>Entity representing a row in [dbo].[Chat]. ChatId = 0 when unsaved.</summary>
  public class Chat
  {
    public int ChatId { get; set; }
    public string Email { get; set; } = "";
    public DateTime ChatStartDate { get; set; }
    public DateTime ChatUpdate { get; set; }
    public string Title { get; set; } = "";
    public ChatMessageDto[]? Content { get; set; }
  }
}
