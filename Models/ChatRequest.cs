namespace OpenAIServiceGpt4o.Models
{
  public class ChatRequest
  {
    public List<ChatMessageDto> Messages { get; set; } = new();
    /// <summary>When provided, appends to this chat; otherwise a new chat is created.</summary>
    public Guid? ChatId { get; set; }
    /// <summary>When true (default), assistant messages are sent to OpenAI; when false, only user and system messages are sent (reduces cost).</summary>
    public bool IncludeResponses { get; set; } = true;
    /// <summary>When true (default), system (memory) message is sent to OpenAI; when false, it is omitted (reduces cost).</summary>
    public bool IncludeMemory { get; set; } = true;
  }
}
