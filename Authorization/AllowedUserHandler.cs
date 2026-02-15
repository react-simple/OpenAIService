using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using OpenAIServiceGpt4o.Services;

namespace OpenAIServiceGpt4o.Authorization
{
  public class AllowedUserHandler : AuthorizationHandler<AllowedUserRequirement>
  {
    private readonly IAllowedUserService _allowedUserService;
    private readonly IUserService _userService;

    public AllowedUserHandler(IAllowedUserService allowedUserService, IUserService userService)
    {
      _allowedUserService = allowedUserService;
      _userService = userService;
    }

    protected override async Task HandleRequirementAsync(
      AuthorizationHandlerContext context,
      AllowedUserRequirement requirement)
    {
      var email = context.User.Claims
        .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
        ?? context.User.Claims
          .FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;

      if (string.IsNullOrWhiteSpace(email))
      {
        context.Fail();
        return;
      }

      var isAllowed = await _allowedUserService.IsAllowedAsync(email).ConfigureAwait(false);

      if (isAllowed)
      {
        var ct = (context.Resource as HttpContext)?.RequestAborted ?? default;
        await _userService.UpdateLastActivityAsync(email, ct).ConfigureAwait(false);
        context.Succeed(requirement);
      }
      else
        context.Fail();
    }
  }
}
