namespace OpenAIServiceGpt4o.Models
{
  public class User
  {
    public string Email { get; set; } = "";
    public bool IsEnabled { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime LastLoginDate { get; set; }
  }
}
