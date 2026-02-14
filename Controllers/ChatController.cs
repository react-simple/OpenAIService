using Azure.AI.OpenAI;
using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o.Models;
using OpenAI.Chat;
using System.ClientModel;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api")]
  public class ChatController : ControllerBase
  {
    private readonly IConfiguration _config;

    private static readonly ChatCompletionOptions RequestOptions = new()
    {
      Temperature = 0.7f,
      TopP = 1.0f,
      FrequencyPenalty = 0f,
      PresencePenalty = 0f
    };

    public ChatController(IConfiguration config)
    {
      _config = config;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<ChatResponse>> PostChat([FromBody] ChatRequest request)
    {
      var configuredPin = _config["Pin"] ?? "";

      if (string.IsNullOrEmpty(configuredPin))
        return StatusCode(500, "Pin is not configured (set Pin in User Secrets or App Settings).");

      var pin = Request.Headers["X-Pin"].FirstOrDefault();

      if (string.IsNullOrEmpty(pin) || pin != configuredPin)
        return Unauthorized();

      var endpoint = _config["Endpoint"] ?? "";
      var key = _config["OpenAIKey"] ?? "";
      var model = _config["ModelName"] ?? "";

      if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(model))
        return StatusCode(500, "Azure OpenAI is not configured (Endpoint, OpenAIKey, ModelName).");

      var credential = new ApiKeyCredential(key);
      var azureClient = new AzureOpenAIClient(new Uri(endpoint), credential);
      var chatClient = azureClient.GetChatClient(model);

      var messages = ToChatMessages(request.Messages);

      try
      {
        var completion = await chatClient.CompleteChatAsync(messages, RequestOptions);
        var response = FromCompletion(completion.Value);
        return Ok(response);
      }
      catch (ClientResultException ex)
      {
        return StatusCode(ex.Status, ex.Message);
      }
    }

    private static List<ChatMessage> ToChatMessages(IEnumerable<ChatMessageDto> dtos)
    {
      var list = new List<ChatMessage>();

      foreach (var d in dtos)
      {
        switch (d.Role)
        {
          case ChatRole.System:
            list.Add(new SystemChatMessage(d.Content ?? ""));
            break;
          case ChatRole.User:
            list.Add(new UserChatMessage(d.Content ?? ""));
            break;
          case ChatRole.Assistant:
            list.Add(new AssistantChatMessage(d.Content ?? ""));
            break;
        }
      }

      return list;
    }

    private static ChatResponse FromCompletion(ChatCompletion completion)
    {
      var response = new ChatResponse { Messages = new List<ChatMessageDto>() };

      var assistantContent = string.Join("\r\n", completion.Content.Select(c => c.Text ?? ""));

      if (!string.IsNullOrEmpty(assistantContent))
        response.Messages.Add(new ChatMessageDto { Role = ChatRole.Assistant, Content = assistantContent });

      return response;
    }
  }
}
