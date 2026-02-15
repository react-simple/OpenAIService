using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public interface IUserChatService
  {
    /// <summary>Inserts a new chat or updates an existing one. Returns the ChatId (new or existing).</summary>
    Task<int> SaveChatAsync(string email, int? chatId, IReadOnlyList<ChatMessageDto> messages, CancellationToken cancellationToken = default);
  }
}
