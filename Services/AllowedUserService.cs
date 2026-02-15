using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;

namespace OpenAIServiceGpt4o.Services
{
  public class AllowedUserService : IAllowedUserService
  {
    private const string CacheKeyPrefix = "AllowedUser:";
    private readonly string _connectionString;
    private readonly IMemoryCache _cache;

    public AllowedUserService(IConfiguration configuration, IMemoryCache cache)
    {
      _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
      _cache = cache;
    }

    public async Task<bool> IsAllowedAsync(string email, bool allowCached = true, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return false;

      var key = CacheKeyPrefix + email.Trim().ToLowerInvariant();

      if (allowCached && _cache.TryGetValue(key, out bool cached))
        return cached;

      await using var connection = new SqlConnection(_connectionString);
      await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

      await using var cmd = new SqlCommand(
        "SELECT 1 FROM [dbo].[User] WHERE [Email] = @Email AND [IsEnabled] = 1",
        connection);
      cmd.Parameters.AddWithValue("@Email", email);

      await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
      var allowed = await reader.ReadAsync(cancellationToken).ConfigureAwait(false);
      _cache.Set(key, allowed, TimeSpan.FromMinutes(Constants.AllowedUserCacheDurationMinutes));
      return allowed;
    }
  }
}
