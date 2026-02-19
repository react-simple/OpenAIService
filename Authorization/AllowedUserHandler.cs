using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using OpenAIServiceGpt4o.Helpers;
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
      var email = context.User.GetEmail();

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
