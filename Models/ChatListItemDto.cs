namespace OpenAIServiceGpt4o.Models
{
  public class ChatListItemDto
  {
    public int ChatId { get; set; }
    public string Title { get; set; } = "";
    public DateTime ChatUpdate { get; set; }
  }
}
