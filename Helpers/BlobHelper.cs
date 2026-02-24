using System.Text;
using OpenAIServiceGpt4o;

namespace OpenAIServiceGpt4o.Helpers
{
  public static class BlobHelper
  {
    /// <summary>Maps email to a safe, human-readable blob path segment by replacing non-allowed characters with underscores.</summary>
    public static string SanitizeEmailForBlobPath(string email)
    {
      if (string.IsNullOrWhiteSpace(email))
        return "";

      var trimmed = email.Trim();
      var sb = new StringBuilder(trimmed.Length);
      var lastWasUnderscore = false;

      for (var i = 0; i < trimmed.Length; i++)
      {
        var c = trimmed[i];

        if (char.IsLetterOrDigit(c))
        {
          sb.Append(c);
          lastWasUnderscore = false;
        }
        else
        {
          if (!lastWasUnderscore)
            sb.Append('_');

          lastWasUnderscore = true;
        }
      }

      return sb.ToString().Trim('_');
    }
  }
}
