using Azure.AI.OpenAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Models;
using OpenAIServiceGpt4o.Services;
using OpenAI.Chat;
using System.ClientModel;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api")]
  [Authorize]
  public class ChatController : ControllerBase
  {
    private readonly ChatClient _chatClient;
    private readonly IUserChatService _chatService;

    public ChatController(ChatClient chatClient, IUserChatService chatService)
    {
      _chatClient = chatClient;
      _chatService = chatService;
    }

    private static readonly ChatCompletionOptions RequestOptions = new()
    {
      Temperature = 0.7f,
      TopP = 1.0f,
      FrequencyPenalty = 0f,
      PresencePenalty = 0f
    };

    [HttpPost("chat")]
    public async Task<ActionResult<ChatResponse>> PostChat([FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
      var email = User.GetEmail();

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      var chatClient = _chatClient;
      var chat = await _chatService.GetChatAsync(email, request.ChatId, cancellationToken);

      var messagesToSend = request.Messages.AsEnumerable();
      if (!request.IncludeResponses)
        messagesToSend = messagesToSend.Where(m => m.Role != ChatRole.Assistant);
      if (!request.IncludeMemory)
        messagesToSend = messagesToSend.Where(m => m.Role != ChatRole.System);
      var messages = ToChatMessages(messagesToSend.ToList());

      try
      {
        var completion = await chatClient.CompleteChatAsync(messages, RequestOptions);
        var response = FromCompletion(completion.Value);

        var fullMessages = request.Messages.Concat(response.Messages).Where(m => m.Role != ChatRole.System).ToList();
        chat.Content = fullMessages.Count > 0 ? fullMessages.ToArray() : null;
        await _chatService.SaveChatAsync(chat, cancellationToken);

        await TryGenerateAndSaveTitleAsync(chatClient, chat, fullMessages, cancellationToken);

        response.ChatId = chat.ChatId;
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

    private async Task TryGenerateAndSaveTitleAsync(
      ChatClient chatClient,
      Chat chat,
      IReadOnlyList<ChatMessageDto> fullMessages,
      CancellationToken cancellationToken)
    {
      var defaultTitle = "Chat #" + chat.ChatId;
      var hasFinalTitle = chat.Title != defaultTitle && !chat.Title.EndsWith('*');

      if (hasFinalTitle)
        return;

      var userMessages = fullMessages.Where(m => m.Role == ChatRole.User).ToList();
      var userOnlyLength = userMessages.Sum(m => (m.Content ?? "").Length);
      var userMessageCount = userMessages.Count;
      var conditionMet = userOnlyLength >= Constants.MinUserCharsForTitle || userMessageCount >= Constants.MinUserMessagesForTitle;

      if (conditionMet)
      {
        // Chat is long enough: generate and save final title (no asterisk).
        await GenerateAndSaveTitleAsync(chatClient, chat, fullMessages, cancellationToken, temp: false);
        return;
      }

      // First exchange with default title: generate and save temp title (ends with *).
      if (chat.Title == defaultTitle)
        await GenerateAndSaveTitleAsync(chatClient, chat, fullMessages, cancellationToken, temp: true);
    }

    private async Task GenerateAndSaveTitleAsync(
      ChatClient chatClient,
      Chat chat,
      IReadOnlyList<ChatMessageDto> fullMessages,
      CancellationToken cancellationToken,
      bool temp)
    {
      var conversationText = FormatConversationForTitle(fullMessages);

      var titleMessages = new List<ChatMessage>
      {
        new SystemChatMessage(Constants.ChatTitleGenerationSystemMessage),
        new UserChatMessage(conversationText)
      };

      try
      {
        var completion = await chatClient.CompleteChatAsync(titleMessages, RequestOptions);
        var title = string.Join(" ", completion.Value.Content.Select(c => c.Text ?? "")).Trim();

        if (string.IsNullOrEmpty(title))
          return;

        if (title.Length > Constants.MaxChatTitleLength)
          title = title[..Constants.MaxChatTitleLength];

        if (temp)
          title = title.TrimEnd('*').TrimEnd() + "*";

        chat.Title = title;
        await _chatService.SaveChatAsync(chat, cancellationToken);
      }
      catch
      {
        // Keep current title on failure
      }
    }

    private static string FormatConversationForTitle(IReadOnlyList<ChatMessageDto> messages)
    {
      var parts = new List<string>();

      foreach (var m in messages)
      {
        if (m.Role == ChatRole.System)
          continue;

        var role = m.Role == ChatRole.User ? "User" : "Assistant";
        parts.Add($"{role}: {m.Content?.Trim() ?? ""}");
      }

      return string.Join("\n\n", parts);
    }
  }
}
