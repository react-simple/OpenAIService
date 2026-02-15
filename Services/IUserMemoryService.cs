namespace OpenAIServiceGpt4o.Services
{
  public interface IUserMemoryService
  {
    Task<string?> GetAsync(string email, CancellationToken cancellationToken = default);
    Task SetAsync(string email, string content, CancellationToken cancellationToken = default);
  }
}
