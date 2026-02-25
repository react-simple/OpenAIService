using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public class UserChatService
  {
    private readonly BlobServiceClient _storageClient;
    private readonly string _containerName;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
      Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public UserChatService(BlobServiceClient storageClient, IOptions<AzureStorageOptions> storageOptions)
    {
      _storageClient = storageClient ?? throw new ArgumentNullException(nameof(storageClient));
      _containerName = storageOptions?.Value?.ContainerName ?? throw new ArgumentNullException(nameof(storageOptions));
    }

    private BlobContainerClient GetContainer()
    {
      return _storageClient.GetBlobContainerClient(_containerName);
    }

    private static string ChatPath(string email, Guid chatId)
    {
      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      return $"{Constants.Storage.ChatsPrefix}{sanitized}/{chatId:N}.json";
    }

    public async Task<Chat> GetChatAsync(string email, Guid? chatId, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        throw new ArgumentException("Email is required.", nameof(email));

      if (chatId is null || chatId == Guid.Empty)
        return NewUnsavedChat(email);

      var container = GetContainer();
      var path = ChatPath(email, chatId.Value);
      var client = container.GetBlobClient(path);

      if (!await client.ExistsAsync(cancellationToken).ConfigureAwait(false))
        return NewUnsavedChat(email);

      await using var stream = await client.OpenReadAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
      var chat = await JsonSerializer.DeserializeAsync<Chat>(stream, JsonOptions, cancellationToken).ConfigureAwait(false);
      if (chat == null)
        return NewUnsavedChat(email);

      if (chat.Content != null)
        chat.Content = chat.Content.Where(m => m.Role != ChatRole.System).ToArray();

      return chat;
    }

    public async Task<IReadOnlyList<ChatListItemDto>> GetChatListAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return Array.Empty<ChatListItemDto>();

      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      var prefix = $"{Constants.Storage.ChatsPrefix}{sanitized}/";
      var container = GetContainer();
      var list = new List<ChatListItemDto>();

      await foreach (var item in container.GetBlobsAsync(prefix: prefix, cancellationToken: cancellationToken).ConfigureAwait(false))
      {
        var path = item.Name;
        var fileName = path.Length > prefix.Length ? path.Substring(prefix.Length) : "";
        if (fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
          fileName = fileName.Substring(0, fileName.Length - 5);
        if (!Guid.TryParse(fileName, out var id))
          continue;

        var chat = await GetChatAsync(email, id, cancellationToken).ConfigureAwait(false);
        if (chat.ChatId == Guid.Empty)
          continue;

        list.Add(new ChatListItemDto { ChatId = chat.ChatId, Title = chat.Title, ChatUpdate = chat.ChatUpdate });
      }

      return list.OrderByDescending(c => c.ChatUpdate).ToList();
    }

    public async Task SaveChatAsync(Chat chat, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(chat.Email))
        throw new ArgumentException("Chat Email is required.", nameof(chat));

      var now = DateTime.UtcNow;
      chat.ChatUpdate = now;

      if (chat.ChatId == Guid.Empty)
      {
        chat.ChatId = Guid.NewGuid();
        chat.ChatStartDate = now;
        chat.Title = "Chat #" + chat.ChatId;
      }

      var path = ChatPath(chat.Email, chat.ChatId);
      var container = GetContainer();
      var client = container.GetBlobClient(path);
      var json = JsonSerializer.Serialize(chat, JsonOptions);
      var bytes = Encoding.UTF8.GetBytes(json);
      await using var stream = new MemoryStream(bytes);
      await client.UploadAsync(stream, overwrite: true, cancellationToken).ConfigureAwait(false);
    }

    public async Task<bool> DeleteChatAsync(string email, Guid chatId, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return false;

      if (chatId == Guid.Empty)
        return false;

      var path = ChatPath(email, chatId);
      var container = GetContainer();
      var client = container.GetBlobClient(path);
      var exists = await client.ExistsAsync(cancellationToken).ConfigureAwait(false);
      if (!exists.Value)
        return false;

      await client.DeleteIfExistsAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
      return true;
    }

    public async Task<bool> UpdateChatContentAsync(string email, Guid chatId, IReadOnlyList<ChatMessageDto> content, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email) || chatId == Guid.Empty)
        return false;

      var chat = await GetChatAsync(email, chatId, cancellationToken).ConfigureAwait(false);

      if (chat.ChatId != chatId)
        return false;

      var now = DateTime.UtcNow;
      chat.ChatUpdate = now;
      chat.Content = content.Count > 0 ? content.Where(m => m.Role != ChatRole.System).ToArray() : null;

      var path = ChatPath(email, chatId);
      var container = GetContainer();
      var client = container.GetBlobClient(path);
      var json = JsonSerializer.Serialize(chat, JsonOptions);
      var bytes = Encoding.UTF8.GetBytes(json);
      await using var stream = new MemoryStream(bytes);
      await client.UploadAsync(stream, overwrite: true, cancellationToken).ConfigureAwait(false);
      return true;
    }

    private static Chat NewUnsavedChat(string email)
    {
      var now = DateTime.UtcNow;
      return new Chat
      {
        ChatId = Guid.Empty,
        Email = email,
        ChatStartDate = now,
        ChatUpdate = now,
        Title = "",
        Content = null,
      };
    }
  }
}
