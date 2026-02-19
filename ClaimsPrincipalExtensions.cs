using System.Security.Claims;

namespace OpenAIServiceGpt4o
{
  public static class ClaimsPrincipalExtensions
  {
    /// <summary>Gets the user's email from claims (supports both ClaimTypes.Email and Google's claim type).</summary>
    public static string? GetEmail(this ClaimsPrincipal? principal)
    {
      if (principal == null)
        return null;

      var value = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

      if (!string.IsNullOrWhiteSpace(value))
        return value;

      return principal.Claims.FirstOrDefault(c => c.Type == Constants.ClaimTypeEmailFallback)?.Value;
    }
  }
}
