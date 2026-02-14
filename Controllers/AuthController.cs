using Microsoft.AspNetCore.Mvc;
using OpenAIServiceGpt4o.Models;
using System.Text.RegularExpressions;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("api/auth")]
  public class AuthController : ControllerBase
  {
    private const int PinLength = 8;

    private readonly IConfiguration _config;

    private static readonly Regex PinFormat = new($"^[A-Za-z0-9]{{{PinLength}}}$", RegexOptions.Compiled);

    public AuthController(IConfiguration config)
    {
      _config = config;
    }

    [HttpPost("validate-pin")]
    public IActionResult ValidatePin([FromBody] PinRequest request)
    {
      var configuredPin = _config["Pin"] ?? "";

      if (string.IsNullOrEmpty(configuredPin))
        return StatusCode(500, "Pin is not configured (set Pin in User Secrets or App Settings).");

      var pin = (request?.Pin ?? "").Trim();

      if (!PinFormat.IsMatch(pin))
        return BadRequest($"Pin must be exactly {PinLength} alphanumeric characters.");

      if (pin != configuredPin)
        return Unauthorized();

      return Ok();
    }
  }
}
