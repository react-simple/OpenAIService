using System.Text;
using System.Text.Json;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Models;

namespace OpenAIServiceGpt4o.Services
{
  public class UserService
  {
    private readonly BlobServiceClient _storageClient;
    private readonly string _containerName;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      PropertyNameCaseInsensitive = true,
    };

    public UserService(BlobServiceClient storageClient, IOptions<AzureStorageOptions> storageOptions)
    {
      _storageClient = storageClient ?? throw new ArgumentNullException(nameof(storageClient));
      _containerName = storageOptions?.Value?.ContainerName ?? throw new ArgumentNullException(nameof(storageOptions));
    }

    private static string UserPath(string email)
    {
      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      return $"{Constants.Storage.UsersPrefix}{sanitized}.json";
    }

    private async Task<User?> GetUserAsync(string email, CancellationToken cancellationToken)
    {
      var path = UserPath(email);
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);

      if (!await client.ExistsAsync(cancellationToken).ConfigureAwait(false))
        return null;

      var response = await client.DownloadContentAsync(cancellationToken).ConfigureAwait(false);
      var json = response.Value.Content.ToString();
      return JsonSerializer.Deserialize<User>(json, JsonOptions);
    }

    private async Task SaveUserAsync(User user, CancellationToken cancellationToken)
    {
      var path = UserPath(user.Email);
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);
      var json = JsonSerializer.Serialize(user, JsonOptions);
      var bytes = Encoding.UTF8.GetBytes(json);
      await using var stream = new MemoryStream(bytes);
      await client.UploadAsync(stream, overwrite: true, cancellationToken).ConfigureAwait(false);
    }

    public async Task UpdateLastLoginAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return;

      var user = await GetUserAsync(email, cancellationToken).ConfigureAwait(false);
      if (user == null)
        return;

      user.LastLoginDate = DateTime.UtcNow;
      await SaveUserAsync(user, cancellationToken).ConfigureAwait(false);
    }
  }
}
