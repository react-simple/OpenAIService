using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Caching.Memory;
using OpenAIServiceGpt4o.Authorization;
using OpenAIServiceGpt4o.Services;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
  .AddCookie()
  .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
  {
    options.ClientId = config["Google:ClientId"] ?? "";
    options.ClientSecret = config["Google:ClientSecret"] ?? "";
  });

builder.Services.AddMemoryCache();
builder.Services.AddScoped<IAllowedUserService, AllowedUserService>();
builder.Services.AddScoped<IUserMemoryService, UserMemoryService>();
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
