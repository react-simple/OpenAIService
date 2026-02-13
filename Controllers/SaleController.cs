using Microsoft.AspNetCore.Mvc;

namespace OpenAIServiceGpt4o.Controllers
{
  [ApiController]
  [Route("sale")]
  public class OpenAIServiceController : ControllerBase
  {
    private readonly IConfiguration Config;

    public OpenAIServiceController(IConfiguration config)
    {
      Config = config;
    }
  }
}