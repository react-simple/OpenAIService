using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.AI.OpenAI;
using Azure.Storage.Blobs;
using Azure.Storage;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using OpenAIServiceGpt4o;
using OpenAIServiceGpt4o.Authorization;
using OpenAIServiceGpt4o.Helpers;
using OpenAIServiceGpt4o.Services;
using OpenAI.Chat;
using System.ClientModel;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
  .AddCookie(options =>
  {
    options.Events.OnSignedIn = async context =>
    {
      var email = context.Principal?.GetEmail();
      if (!string.IsNullOrWhiteSpace(email))
      {
        var userService = context.HttpContext.RequestServices.GetService<OpenAIServiceGpt4o.Services.UserService>();
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

var endpoint = config["OpenAI:Endpoint"] ?? "";
var key = config["OpenAI:Key"] ?? "";
var model = config["OpenAI:ModelName"] ?? "";
if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(model))
  throw new InvalidOperationException("Azure OpenAI is not configured. Set OpenAI:Endpoint, OpenAI:Key, and OpenAI:ModelName.");

var openAIClient = new AzureOpenAIClient(new Uri(endpoint), new ApiKeyCredential(key));
builder.Services.AddSingleton(openAIClient.GetChatClient(model));

builder.Services.Configure<AzureStorageOptions>(config.GetSection(AzureStorageOptions.SectionName));
var storageOptions = config.GetSection(AzureStorageOptions.SectionName).Get<AzureStorageOptions>();
if (storageOptions == null || string.IsNullOrEmpty(storageOptions.AccountName) || string.IsNullOrEmpty(storageOptions.AccountKey) || string.IsNullOrEmpty(storageOptions.ContainerName))
  throw new InvalidOperationException("Azure Storage is not configured. Set AzureStorage:AccountName, AzureStorage:AccountKey, and AzureStorage:ContainerName (e.g. trmopenaiservice).");

var blobServiceUri = new Uri($"https://{storageOptions.AccountName}.blob.core.windows.net");
var storageCredential = new StorageSharedKeyCredential(storageOptions.AccountName, storageOptions.AccountKey);
var blobServiceClient = new BlobServiceClient(blobServiceUri, storageCredential);
builder.Services.AddSingleton(blobServiceClient);

builder.Services.AddMemoryCache();
builder.Services.AddScoped<AllowedUserService>();
builder.Services.AddScoped<ErrorLogService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<UserMemoryService>();
builder.Services.AddScoped<UserChatService>();
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
    var logService = context.RequestServices.GetService<OpenAIServiceGpt4o.Services.ErrorLogService>();
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
