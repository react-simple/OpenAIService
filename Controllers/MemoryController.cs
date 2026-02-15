using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o.Services;
using System.Security.Claims;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api/memory")]
  [Authorize]
  public class MemoryController : ControllerBase
  {
    private readonly IUserMemoryService _memoryService;

    public MemoryController(IUserMemoryService memoryService)
    {
      _memoryService = memoryService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
      var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
        ?? User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      var content = await _memoryService.GetAsync(email, cancellationToken).ConfigureAwait(false);
      return Ok(new { content });
    }

    [HttpPut]
    public async Task<IActionResult> Put([FromBody] MemoryPutRequest request, CancellationToken cancellationToken)
    {
      var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
        ?? User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;

      if (string.IsNullOrWhiteSpace(email))
        return Unauthorized();

      await _memoryService.SetAsync(email, request?.Content ?? "", cancellationToken).ConfigureAwait(false);
      return Ok();
    }

    public class MemoryPutRequest
    {
      public string? Content { get; set; }
    }
  }
}
