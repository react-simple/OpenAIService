using System.Text;
using System.Text.Json;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Specialized;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o;
using OpenAIServiceGpt4o.Helpers;

namespace OpenAIServiceGpt4o.Services
{
  public class ErrorLogService
  {
    private readonly BlobServiceClient _storageClient;
    private readonly string _containerName;

    public ErrorLogService(BlobServiceClient storageClient, IOptions<AzureStorageOptions> storageOptions)
    {
      _storageClient = storageClient ?? throw new ArgumentNullException(nameof(storageClient));
      _containerName = storageOptions?.Value?.ContainerName ?? throw new ArgumentNullException(nameof(storageOptions));
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
        var now = DateTime.UtcNow;
        var year = now.Year;
        var date = now.ToString("yyyy-MM-dd");
        var path = $"{Constants.Storage.ErrorsPrefix}{year}/{date}.txt";

        var container = _storageClient.GetBlobContainerClient(_containerName);
        var logClient = container.GetAppendBlobClient(path);

        await logClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken).ConfigureAwait(false);

        var line = JsonSerializer.Serialize(new { at = now, message = shortMessage, full = fullException }) + "\n";
        var bytes = Encoding.UTF8.GetBytes(line);
        await using var stream = new MemoryStream(bytes);
        await logClient.AppendBlockAsync(stream, cancellationToken: cancellationToken).ConfigureAwait(false);
      }
      catch
      {
        // Avoid throwing if error logging fails.
      }
    }
  }
}
