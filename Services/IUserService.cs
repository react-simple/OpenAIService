namespace OpenAIServiceGpt4o.Services
{
  public interface IUserService
  {
    Task UpdateLastLoginAsync(string email, CancellationToken cancellationToken = default);
    Task UpdateLastActivityAsync(string email, CancellationToken cancellationToken = default);
  }
}
