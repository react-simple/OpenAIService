using Microsoft.Data.SqlClient;

namespace OpenAIServiceGpt4o.Services
{
  public interface IUserMemoryService
  {
    Task<string?> GetAsync(string email, CancellationToken cancellationToken = default);
    Task SetAsync(string email, string content, CancellationToken cancellationToken = default);
  }

  public class UserMemoryService : IUserMemoryService
  {
    private readonly string _connectionString;

    public UserMemoryService(IConfiguration configuration)
    {
      _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    public async Task<string?> GetAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return null;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      await using var cmd = new SqlCommand(
        "SELECT [Memory] FROM [dbo].[Memory] WHERE [Email] = @Email",
        connection);
      cmd.Parameters.AddWithValue("@Email", email);

      var value = await cmd.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);

      if (value == null || value == DBNull.Value)
        return null;

      return (string)value;
    }

    public async Task SetAsync(string email, string content, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      await using var cmd = new SqlCommand(
        @"MERGE [dbo].[Memory] AS t
          USING (SELECT @Email AS [Email], @Memory AS [Memory]) AS s ON t.[Email] = s.[Email]
          WHEN MATCHED THEN UPDATE SET t.[Memory] = s.[Memory]
          WHEN NOT MATCHED THEN INSERT ([Email], [Memory]) VALUES (s.[Email], s.[Memory]);",
        connection);
      cmd.Parameters.AddWithValue("@Email", email);
      cmd.Parameters.AddWithValue("@Memory", (object?)content ?? DBNull.Value);

      await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }
  }
}
