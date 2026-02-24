using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public class UserService
  {
    private readonly BlobServiceClient _storageClient;
    private readonly IMemoryCache _cache;
    private readonly string _containerName;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      PropertyNameCaseInsensitive = true,
    };

    public UserService(BlobServiceClient storageClient, IMemoryCache cache, IOptions<AzureStorageOptions> storageOptions)
    {
      _storageClient = storageClient ?? throw new ArgumentNullException(nameof(storageClient));
      _cache = cache;
      _containerName = storageOptions?.Value?.ContainerName ?? throw new ArgumentNullException(nameof(storageOptions));
    }

    private static string UserPath(string email)
    {
      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      return $"{Constants.Storage.UsersPrefix}{sanitized}.json";
    }

    private async Task<UserRecord?> GetUserAsync(string email, CancellationToken cancellationToken)
    {
      var path = UserPath(email);
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);

      if (!await client.ExistsAsync(cancellationToken).ConfigureAwait(false))
        return null;

      var response = await client.DownloadContentAsync(cancellationToken).ConfigureAwait(false);
      var json = response.Value.Content.ToString();
      return JsonSerializer.Deserialize<UserRecord>(json, JsonOptions);
    }

    private async Task SaveUserAsync(UserRecord dto, CancellationToken cancellationToken)
    {
      var path = UserPath(dto.Email);
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);
      var json = JsonSerializer.Serialize(dto, JsonOptions);
      var bytes = Encoding.UTF8.GetBytes(json);
      await using var stream = new MemoryStream(bytes);
      await client.UploadAsync(stream, overwrite: true, cancellationToken).ConfigureAwait(false);
    }

    public async Task UpdateLastLoginAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return;

      var dto = await GetUserAsync(email, cancellationToken).ConfigureAwait(false);
      if (dto == null)
        return;

      dto.LastLoginDate = DateTime.UtcNow;
      await SaveUserAsync(dto, cancellationToken).ConfigureAwait(false);
    }
  }
}
