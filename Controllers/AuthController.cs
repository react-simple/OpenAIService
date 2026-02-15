using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api/auth")]
  public class AuthController : ControllerBase
  {
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
      _config = config;
    }

    [HttpGet("login")]
    public IActionResult Login()
    {
      var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:44489";

      return Challenge(new AuthenticationProperties { RedirectUri = frontendUrl }, GoogleDefaults.AuthenticationScheme);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
      if (User.Identity?.IsAuthenticated != true)
        return Unauthorized();

      var email = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value
        ?? User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;

      return Ok(new { email });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
      await HttpContext.SignOutAsync();

      return Ok();
    }
  }
}
