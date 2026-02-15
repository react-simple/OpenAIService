namespace OpenAIServiceGpt4o.Services
{
  public interface IErrorLogService
  {
    Task LogAsync(Exception ex, string? message = null, CancellationToken cancellationToken = default);
  }
}
