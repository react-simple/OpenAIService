using Microsoft.AspNetCore.Authorization;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Services;

namespace OpenAIServiceGpt4o.Authorization
{
  public class AllowedUserHandler : AuthorizationHandler<AllowedUserRequirement>
  {
    private readonly AllowedUserService _allowedUserService;

    public AllowedUserHandler(AllowedUserService allowedUserService)
    {
      _allowedUserService = allowedUserService;
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
        context.Succeed(requirement);
      else
        context.Fail();
    }
  }
}
