namespace OpenAIServiceGpt4o.Services
{
  public interface IAllowedUserService
  {
    Task<bool> IsAllowedAsync(string email, bool allowCached = true, CancellationToken cancellationToken = default);
  }
}
