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

    public async Task<int> SaveChatAsync(string email, int? chatId, IReadOnlyList<ChatMessageDto> messages, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        throw new ArgumentException("Email is required.", nameof(email));

      var contentJson = messages.Count > 0 ? JsonSerializer.Serialize(messages, JsonOptions) : null;
      var now = DateTime.UtcNow;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      if (chatId is null)
      {
        var title = "Chat " + now.ToString("yyyy-MM-dd HH:mm:ss", System.Globalization.CultureInfo.InvariantCulture);
        await using var cmd = new SqlCommand(
          @"INSERT INTO [dbo].[Chat] ([Email], [ChatStartDate], [ChatUpdate], [Title], [Content])
            VALUES (@Email, @ChatStartDate, @ChatUpdate, @Title, @Content);
            SELECT CAST(SCOPE_IDENTITY() AS INT);",
          connection);
        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@ChatStartDate", now);
        cmd.Parameters.AddWithValue("@ChatUpdate", now);
        cmd.Parameters.AddWithValue("@Title", title);
        cmd.Parameters.AddWithValue("@Content", (object?)contentJson ?? DBNull.Value);

        var id = await cmd.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        return Convert.ToInt32(id);
      }

      // Update existing chat only (no update after insert)
      await using var updateCmd = new SqlCommand(
        @"UPDATE [dbo].[Chat] SET [Content] = @Content, [ChatUpdate] = @ChatUpdate
          WHERE [ChatId] = @ChatId AND [Email] = @Email;",
        connection);
      updateCmd.Parameters.AddWithValue("@ChatId", chatId.Value);
      updateCmd.Parameters.AddWithValue("@Email", email);
      updateCmd.Parameters.AddWithValue("@Content", (object?)contentJson ?? DBNull.Value);
      updateCmd.Parameters.AddWithValue("@ChatUpdate", now);

      await updateCmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
      return chatId.Value;
    }
  }
}
