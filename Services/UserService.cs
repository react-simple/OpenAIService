using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;

namespace OpenAIServiceGpt4o.Services
{
  public class UserService : IUserService
  {
    private const string LastActivityCacheKeyPrefix = "LastActivity:";
    private readonly string _connectionString;
    private readonly IMemoryCache _cache;

    public UserService(IConfiguration configuration, IMemoryCache cache)
    {
      _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
      _cache = cache;
    }

    public async Task UpdateLastLoginAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      await using var cmd = new SqlCommand(
        "UPDATE [dbo].[User] SET [LastLoginDate] = GETDATE() WHERE [Email] = @Email;",
        connection);
      cmd.Parameters.AddWithValue("@Email", email);
      await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task UpdateLastActivityAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return;

      var key = LastActivityCacheKeyPrefix + email.Trim().ToLowerInvariant();
      var now = DateTime.UtcNow;
      var debounce = TimeSpan.FromSeconds(Constants.LastActivityUpdateDebounceSeconds);

      if (_cache.TryGetValue(key, out object? cached) && cached is DateTime lastAt && (now - lastAt) < debounce)
        return;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      await using var cmd = new SqlCommand(
        "UPDATE [dbo].[User] SET [LastActivityDate] = GETDATE() WHERE [Email] = @Email;",
        connection);
      cmd.Parameters.AddWithValue("@Email", email);
      await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);

      _cache.Set(key, now, debounce);
    }
  }
}
