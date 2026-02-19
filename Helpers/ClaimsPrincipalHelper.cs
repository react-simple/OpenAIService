using System.Security.Claims;
using OpenAIServiceGpt4o;

namespace OpenAIServiceGpt4o.Helpers
{
  public static class ClaimsPrincipalHelper
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
