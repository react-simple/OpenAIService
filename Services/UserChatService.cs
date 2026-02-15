using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient;
using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public class UserChatService : IUserChatService
  {
    private readonly string _connectionString;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
      Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public UserChatService(IConfiguration configuration)
    {
      _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    public async Task<Chat> GetChatAsync(string email, int? chatId, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        throw new ArgumentException("Email is required.", nameof(email));

      if (chatId is null or 0)
        return NewUnsavedChat(email);

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      await using var cmd = new SqlCommand(
        "SELECT [ChatId], [Email], [ChatStartDate], [ChatUpdate], [Title], [Content] FROM [dbo].[Chat] WHERE [ChatId] = @ChatId AND [Email] = @Email;",
        connection);
      cmd.Parameters.AddWithValue("@ChatId", chatId.Value);
      cmd.Parameters.AddWithValue("@Email", email);

      await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

      if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        return NewUnsavedChat(email);

      var contentJson = reader.IsDBNull(5) ? null : reader.GetString(5);
      return new Chat
      {
        ChatId = reader.GetInt32(0),
        Email = reader.GetString(1),
        ChatStartDate = reader.GetDateTime(2),
        ChatUpdate = reader.GetDateTime(3),
        Title = reader.GetString(4),
        Content = string.IsNullOrEmpty(contentJson) ? null : JsonSerializer.Deserialize<ChatMessageDto[]>(contentJson, JsonOptions),
      };
    }

    public async Task SaveChatAsync(Chat chat, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(chat.Email))
        throw new ArgumentException("Chat Email is required.", nameof(chat));

      var now = DateTime.UtcNow;
      chat.ChatUpdate = now;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      if (chat.ChatId == 0)
      {
        chat.ChatStartDate = now;
        await using var cmd = new SqlCommand(
          @"INSERT INTO [dbo].[Chat] ([Email], [ChatStartDate], [ChatUpdate], [Title], [Content])
            VALUES (@Email, @ChatStartDate, @ChatUpdate, N'Chat #0', @Content);
            SELECT CAST(SCOPE_IDENTITY() AS INT);",
          connection);
        cmd.Parameters.AddWithValue("@Email", chat.Email);
        cmd.Parameters.AddWithValue("@ChatStartDate", chat.ChatStartDate);
        cmd.Parameters.AddWithValue("@ChatUpdate", chat.ChatUpdate);
        cmd.Parameters.AddWithValue("@Content", chat.Content is null or { Length: 0 } ? DBNull.Value : JsonSerializer.Serialize(chat.Content, JsonOptions));

        var id = Convert.ToInt32(await cmd.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false));
        chat.ChatId = id;
        chat.Title = "Chat #" + id;

        await using var updateTitleCmd = new SqlCommand(
          @"UPDATE [dbo].[Chat] SET [Title] = @Title WHERE [ChatId] = @ChatId AND [Email] = @Email;",
          connection);
        updateTitleCmd.Parameters.AddWithValue("@ChatId", chat.ChatId);
        updateTitleCmd.Parameters.AddWithValue("@Email", chat.Email);
        updateTitleCmd.Parameters.AddWithValue("@Title", chat.Title);
        await updateTitleCmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        return;
      }

      await using var updateCmd = new SqlCommand(
        @"UPDATE [dbo].[Chat] SET [Content] = @Content, [ChatUpdate] = @ChatUpdate, [Title] = @Title
          WHERE [ChatId] = @ChatId AND [Email] = @Email;",
        connection);
      updateCmd.Parameters.AddWithValue("@ChatId", chat.ChatId);
      updateCmd.Parameters.AddWithValue("@Email", chat.Email);
      updateCmd.Parameters.AddWithValue("@Content", chat.Content is null or { Length: 0 } ? DBNull.Value : JsonSerializer.Serialize(chat.Content, JsonOptions));
      updateCmd.Parameters.AddWithValue("@ChatUpdate", chat.ChatUpdate);
      updateCmd.Parameters.AddWithValue("@Title", chat.Title.Trim());

      await updateCmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }

    private static Chat NewUnsavedChat(string email)
    {
      var now = DateTime.UtcNow;
      return new Chat
      {
        ChatId = 0,
        Email = email,
        ChatStartDate = now,
        ChatUpdate = now,
        Title = "",
        Content = null,
      };
    }
  }
}
