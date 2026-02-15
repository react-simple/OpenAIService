using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public interface IUserChatService
  {
    /// <summary>Loads the chat from the database, or returns a new unsaved chat (ChatId = 0) when chatId is null or not found.</summary>
    Task<Chat> GetChatAsync(string email, int? chatId, CancellationToken cancellationToken = default);

    /// <summary>Inserts or updates the chat. Sets ChatId and default Title on the entity when inserting.</summary>
    Task SaveChatAsync(Chat chat, CancellationToken cancellationToken = default);
  }
}
