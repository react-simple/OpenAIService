using System.Security.Claims;

namespace OpenAIServiceGpt4o
{
  public static class Constants
  {
    /// <summary>Alternative email claim type emitted by some identity providers (e.g. Google via cookie auth).</summary>
    public const string AlternativeEmailClaimType = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

    /// <summary>Duration to cache allowed-user lookups (reduces SQL roundtrips).</summary>
    public const int AllowedUserCacheDurationMinutes = 5;

    /// <summary>Debounce: do not update LastActivityDate for the same user again until this many seconds have passed since the last update.</summary>
    public const int LastActivityUpdateDebounceSeconds = 60;

    /// <summary>Minimum total length of user messages (excluding system/assistant) before generating a GPT chat title.</summary>
    public const int MinUserCharsForTitle = 1000;

    /// <summary>Minimum number of user messages before generating a GPT chat title (alternative to MinUserCharsForTitle).</summary>
    public const int MinUserMessagesForTitle = 3;

    /// <summary>System message sent to GPT when generating a short, meaningful chat title from the conversation.</summary>
    public const string ChatTitleGenerationSystemMessage = "You are a helpful assistant. Given the following conversation, respond with only a short, meaningful chat title (a few words, no quotes, no punctuation at the end).";

    /// <summary>Maximum length of a generated chat title (characters).</summary>
    public const int MaxChatTitleLength = 100;
  }

  public static class ClaimsPrincipalExtensions
  {
    /// <summary>Returns the user's email from either the standard or alternative claim type.</summary>
    public static string? GetEmail(this ClaimsPrincipal principal) =>
      principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
      ?? principal.Claims.FirstOrDefault(c => c.Type == Constants.AlternativeEmailClaimType)?.Value;
  }
}
