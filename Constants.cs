namespace OpenAIServiceGpt4o
{
  public static class Constants
  {
    public static class Claims
    {
      /// <summary>Claim type for email used by Google OAuth (fallback when ClaimTypes.Email is not set).</summary>
      public const string ClaimTypeEmailFallback = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    }

    public static class Cache
    {
      /// <summary>Duration to cache allowed-user lookups.</summary>
      public const int AllowedUserCacheDurationMinutes = 5;
    }

    public static class ChatTitle
    {
      /// <summary>Minimum total length of user messages (excluding system/assistant) before generating a GPT chat title.</summary>
      public const int MinUserCharsForTitle = 1000;

      /// <summary>Minimum number of user messages before generating a GPT chat title (alternative to MinUserCharsForTitle).</summary>
      public const int MinUserMessagesForTitle = 3;

      /// <summary>System message sent to GPT when generating a short, meaningful chat title from the conversation.</summary>
      public const string GenerationSystemMessage = "You are a helpful assistant. Given the following conversation, respond with only a short, meaningful chat title (a few words, no quotes, no punctuation at the end).";

      /// <summary>Maximum length of a generated chat title (characters).</summary>
      public const int MaxLength = 100;
    }

    public static class Storage
    {
      public const string ChatsPrefix = "Chats/";
      public const string ErrorsPrefix = "Errors/";
      public const string MemoryPrefix = "Memory/";
      public const string UsersPrefix = "Users/";
    }
  }
}
