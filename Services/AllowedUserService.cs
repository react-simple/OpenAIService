using System.Text.Json;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public class AllowedUserService
  {
    private const string CacheKeyPrefix = "AllowedUser:";
    private readonly BlobServiceClient _storageClient;
    private readonly IMemoryCache _cache;
    private readonly string _containerName;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      PropertyNameCaseInsensitive = true,
    };

    public AllowedUserService(BlobServiceClient storageClient, IMemoryCache cache, IOptions<AzureStorageOptions> storageOptions)
    {
      _storageClient = storageClient ?? throw new ArgumentNullException(nameof(storageClient));
      _cache = cache;
      _containerName = storageOptions?.Value?.ContainerName ?? throw new ArgumentNullException(nameof(storageOptions));
    }

    public async Task<bool> IsAllowedAsync(string email, bool allowCached = true, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return false;

      var key = CacheKeyPrefix + email.Trim().ToLowerInvariant();

      if (allowCached && _cache.TryGetValue(key, out bool cached))
        return cached;

      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      var path = $"{Constants.Storage.UsersPrefix}{sanitized}.json";
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);

      if (!await client.ExistsAsync(cancellationToken).ConfigureAwait(false))
      {
        _cache.Set(key, false, TimeSpan.FromMinutes(Constants.Cache.AllowedUserCacheDurationMinutes));
        return false;
      }

      var response = await client.DownloadContentAsync(cancellationToken).ConfigureAwait(false);
      var json = response.Value.Content.ToString();
      var dto = JsonSerializer.Deserialize<User>(json, JsonOptions);
      var allowed = dto?.IsEnabled ?? false;
      _cache.Set(key, allowed, TimeSpan.FromMinutes(Constants.Cache.AllowedUserCacheDurationMinutes));
      return allowed;
    }
  }
}
