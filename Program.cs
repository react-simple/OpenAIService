using Azure.AI.OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Caching.Memory;
using OpenAIServiceGpt4o;
using OpenAIServiceGpt4o.Authorization;
using OpenAIServiceGpt4o.Services;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;

var openAiEndpoint = config["OpenAI:Endpoint"] ?? throw new InvalidOperationException("OpenAI:Endpoint is required.");
var openAiKey = config["OpenAI:Key"] ?? throw new InvalidOperationException("OpenAI:Key is required.");
var openAiModel = config["OpenAI:ModelName"] ?? throw new InvalidOperationException("OpenAI:ModelName is required.");
builder.Services.AddSingleton(
  new AzureOpenAIClient(new Uri(openAiEndpoint), new ApiKeyCredential(openAiKey)).GetChatClient(openAiModel));

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
  .AddCookie(options =>
  {
    options.Events.OnSignedIn = async context =>
    {
      var email = context.Principal?.GetEmail();
      if (!string.IsNullOrWhiteSpace(email))
      {
        var userService = context.HttpContext.RequestServices.GetService<OpenAIServiceGpt4o.Services.IUserService>();
        if (userService != null)
          await userService.UpdateLastLoginAsync(email, context.HttpContext.RequestAborted).ConfigureAwait(false);
      }
    };
  })
  .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
  {
    options.ClientId = config["Google:ClientId"] ?? "";
    options.ClientSecret = config["Google:ClientSecret"] ?? "";
  });

builder.Services.AddMemoryCache();
builder.Services.AddScoped<IAllowedUserService, AllowedUserService>();
builder.Services.AddScoped<IErrorLogService, ErrorLogService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserMemoryService, UserMemoryService>();
builder.Services.AddScoped<IUserChatService, UserChatService>();
builder.Services.AddAuthorization(options =>
{
  options.AddPolicy("AllowedUser", policy =>
    policy.Requirements.Add(new AllowedUserRequirement()));
  options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .AddRequirements(new AllowedUserRequirement())
    .Build();
});
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, AllowedUserHandler>();

builder.Services.AddControllersWithViews()
  .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

var allowedOrigins = config["AllowedOrigins"]?.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
  ?? new[] { "http://localhost:44489" };

builder.Services.AddCors(options =>
{
  options.AddPolicy(
    name: "MyCors",
    policy =>
    {
      policy.WithOrigins(allowedOrigins);
      policy.AllowAnyHeader();
      policy.AllowAnyMethod();
      policy.AllowCredentials();
    });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
}

app.Use(async (context, next) =>
{
  try
  {
    await next(context);
  }
  catch (Exception ex)
  {
    var logService = context.RequestServices.GetService<OpenAIServiceGpt4o.Services.IErrorLogService>();
    if (logService != null)
      await logService.LogAsync(ex).ConfigureAwait(false);
    throw;
  }
});

app.UseStaticFiles();
app.UseRouting();

app.UseCors("MyCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
