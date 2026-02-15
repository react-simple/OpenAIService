using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
  .AddCookie()
  .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
  {
    options.ClientId = config["Google:ClientId"] ?? "";
    options.ClientSecret = config["Google:ClientSecret"] ?? "";
  });

builder.Services.AddAuthorization();

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
