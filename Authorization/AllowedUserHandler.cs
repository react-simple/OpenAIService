using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using OpenAIServiceGpt4o.Services;

namespace OpenAIServiceGpt4o.Authorization
{
  public class AllowedUserHandler : AuthorizationHandler<AllowedUserRequirement>
  {
    private readonly IAllowedUserService _allowedUserService;

    public AllowedUserHandler(IAllowedUserService allowedUserService)
    {
      _allowedUserService = allowedUserService;
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
        context.Succeed(requirement);
      else
        context.Fail();
    }
  }
}
