using Microsoft.Data.SqlClient;

namespace OpenAIServiceGpt4o.Services
{
  public interface IErrorLogService
  {
    Task LogAsync(Exception ex, string? message = null, CancellationToken cancellationToken = default);
  }

  public class ErrorLogService : IErrorLogService
  {
    private readonly string _connectionString;

    public ErrorLogService(IConfiguration configuration)
    {
      _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    public async Task LogAsync(Exception ex, string? message = null, CancellationToken cancellationToken = default)
    {
      if (ex == null)
        return;

      var fullException = ex.ToString();
      var shortMessage = message ?? ex.Message;
      if (shortMessage.Length > 500)
        shortMessage = shortMessage[..500];

      try
      {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var cmd = new SqlCommand(
          "INSERT INTO [dbo].[Error] ([CreatedAt], [Message], [FullException]) VALUES (@CreatedAt, @Message, @FullException);",
          connection);
        cmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);
        cmd.Parameters.AddWithValue("@Message", (object?)shortMessage ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@FullException", (object?)fullException ?? DBNull.Value);

        await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
      }
      catch
      {
        // Avoid throwing if error logging fails (e.g. DB down or Error table missing).
      }
    }
  }
}
