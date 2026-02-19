using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o.Models;
using OpenAIServiceGpt4o.Services;
using OpenAIServiceGpt4o;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api/chats")]
  [Authorize]
  public class ChatsController : ControllerBase
  {
    private readonly IUserChatService _chatService;

    public ChatsController(IUserChatService chatService)
    {
      _chatService = chatService;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
      var email = User.GetEmail();

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      var list = await _chatService.GetChatListAsync(email, cancellationToken).ConfigureAwait(false);
      return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
      var email = User.GetEmail();

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      var chat = await _chatService.GetChatAsync(email, id, cancellationToken).ConfigureAwait(false);

      if (chat.ChatId != id)
        return NotFound();

      return Ok(chat);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
      var email = User.GetEmail();

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      var deleted = await _chatService.DeleteChatAsync(email, id, cancellationToken).ConfigureAwait(false);

      if (!deleted)
        return NotFound();

      return NoContent();
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
      var email = User.GetEmail();

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      var updated = await _chatService.UpdateChatContentAsync(email, id, request.Messages, cancellationToken).ConfigureAwait(false);

      if (!updated)
        return NotFound();

      return NoContent();
    }
  }
}
