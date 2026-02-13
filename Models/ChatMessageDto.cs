namespace OpenAIServiceGpt4o.Models
{
  public enum ChatRole
  {
    User,
    System,
    Assistant
  }

  public class ChatMessageDto
  {
    public ChatRole Role { get; set; }
    public string Content { get; set; } = "";
  }
}
