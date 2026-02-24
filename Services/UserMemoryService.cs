using System.Text;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o;
using OpenAIServiceGpt4o.Helpers;

namespace OpenAIServiceGpt4o.Services
{
  public class UserMemoryService
  {
    private readonly BlobServiceClient _storageClient;
    private readonly string _containerName;

    public UserMemoryService(BlobServiceClient storageClient, IOptions<AzureStorageOptions> storageOptions)
    {
      _storageClient = storageClient ?? throw new ArgumentNullException(nameof(storageClient));
      _containerName = storageOptions?.Value?.ContainerName ?? throw new ArgumentNullException(nameof(storageOptions));
    }

    public async Task<string?> GetAsync(string email, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return null;

      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      var path = $"{Constants.Storage.MemoryPrefix}{sanitized}.txt";
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);

      if (!await client.ExistsAsync(cancellationToken).ConfigureAwait(false))
        return null;

      var response = await client.DownloadContentAsync(cancellationToken).ConfigureAwait(false);
      return response.Value.Content.ToString();
    }

    public async Task SetAsync(string email, string content, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(email))
        return;

      var sanitized = BlobHelper.SanitizeEmailForBlobPath(email);
      var path = $"{Constants.Storage.MemoryPrefix}{sanitized}.txt";
      var container = _storageClient.GetBlobContainerClient(_containerName);
      var client = container.GetBlobClient(path);

      var bytes = Encoding.UTF8.GetBytes(content ?? "");
      await using var stream = new MemoryStream(bytes);
      await client.UploadAsync(stream, overwrite: true, cancellationToken).ConfigureAwait(false);
    }
  }
}
