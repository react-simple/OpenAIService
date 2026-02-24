namespace OpenAIServiceGpt4o
{
  public class AzureStorageOptions
  {
    public const string SectionName = "AzureStorage";

    public string AccountName { get; set; } = "";
    public string AccountKey { get; set; } = "";
    /// <summary>Blob container name (e.g. trmopenaiservice).</summary>
    public string ContainerName { get; set; } = "";
  }
}
