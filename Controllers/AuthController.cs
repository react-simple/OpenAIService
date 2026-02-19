using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api/auth")]
  [Authorize]
  public class AuthController : ControllerBase
  {
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
      _config = config;
    }

    [AllowAnonymous]
    [HttpGet("login")]
    public IActionResult Login()
    {
      // In Azure, set FrontendUrl in App Settings so redirect after Google sign-in goes to your SPA, not localhost.
      var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:44489";

      return Challenge(new AuthenticationProperties { RedirectUri = frontendUrl }, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
      if (User.Identity?.IsAuthenticated != true)
        return Unauthorized();

      var email = User.GetEmail();

      return Ok(new { email });
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
      await HttpContext.SignOutAsync();

      return Ok();
    }
  }
}
