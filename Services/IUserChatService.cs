using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public interface IUserChatService
  {
    /// <summary>Loads the chat from the database, or returns a new unsaved chat (ChatId = 0) when chatId is null or not found.</summary>
    Task<Chat> GetChatAsync(string email, int? chatId, CancellationToken cancellationToken = default);

    /// <summary>Lists the user's chats ordered by ChatUpdate descending.</summary>
    Task<IReadOnlyList<ChatListItemDto>> GetChatListAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>Inserts or updates the chat. Sets ChatId and default Title on the entity when inserting.</summary>
    Task SaveChatAsync(Chat chat, CancellationToken cancellationToken = default);

    /// <summary>Deletes the chat for the user. Returns true if a row was deleted.</summary>
    Task<bool> DeleteChatAsync(string email, int chatId, CancellationToken cancellationToken = default);

    /// <summary>Updates only the chat content and ChatUpdate timestamp. Returns true if the chat existed and was updated.</summary>
    Task<bool> UpdateChatContentAsync(string email, int chatId, IReadOnlyList<ChatMessageDto> content, CancellationToken cancellationToken = default);
  }
}
