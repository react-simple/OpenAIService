using System.Security.Claims;
using Azure.AI.OpenAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o.Models;
using OpenAIServiceGpt4o.Services;
using OpenAI.Chat;
using System.ClientModel;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api")]
  public class ChatController : ControllerBase
  {
    private readonly IConfiguration _config;
    private readonly IUserChatService _chatService;

    public ChatController(IConfiguration config, IUserChatService chatService)
    {
      _config = config;
      _chatService = chatService;
    }

    private static readonly ChatCompletionOptions RequestOptions = new()
    {
      Temperature = 0.7f,
      TopP = 1.0f,
      FrequencyPenalty = 0f,
      PresencePenalty = 0f
    };

    [Authorize]
    [HttpPost("chat")]
    public async Task<ActionResult<ChatResponse>> PostChat([FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
      var endpoint = _config["OpenAI:Endpoint"] ?? "";
      var key = _config["OpenAI:Key"] ?? "";
      var model = _config["OpenAI:ModelName"] ?? "";

      if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(model))
        return StatusCode(500, "Azure OpenAI is not configured (OpenAI:Endpoint, OpenAI:Key, OpenAI:ModelName).");

      var credential = new ApiKeyCredential(key);
      var azureClient = new AzureOpenAIClient(new Uri(endpoint), credential);
      var chatClient = azureClient.GetChatClient(model);

      var messages = ToChatMessages(request.Messages);

      try
      {
        var completion = await chatClient.CompleteChatAsync(messages, RequestOptions);
        var response = FromCompletion(completion.Value);

        var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
          ?? User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
        if (!string.IsNullOrWhiteSpace(email))
        {
          var fullMessages = request.Messages.Concat(response.Messages).ToList();
          var chatId = await _chatService.SaveChatAsync(email, request.ChatId, fullMessages, cancellationToken);
          response.ChatId = chatId;
        }

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
