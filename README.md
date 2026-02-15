# OpenAIService

React frontend (ClientApp) + .NET backend. Chat UI calls Azure OpenAI via the backend. Sign-in is via Google OAuth; the chat API is protected and requires an authenticated user.

## Configuration

### Azure OpenAI (chat)

The backend needs **OpenAI:Endpoint**, **OpenAI:Key**, **OpenAI:ModelName** for Azure OpenAI.

### Google OAuth (sign-in)

The backend needs **Google:ClientId** and **Google:ClientSecret** from [Google Cloud Console](https://console.cloud.google.com) (OAuth 2.0 Client ID, Web application).

Register the **Authorized redirect URI** in Google: `https://yourdomain.com/signin-google` (production) and/or `http://localhost:5031/signin-google` (local).

Optional:

- **FrontendUrl** — URL of the SPA to redirect to after Google sign-in (default in dev: `http://localhost:44489`).
- **AllowedOrigins** — Semicolon-separated list of origins for CORS (default: `http://localhost:44489`). Must include the SPA origin when it is on a different port/domain.

### Azure Web App (production)

Set all values as **Application settings** in the Azure Portal (Configuration → Application settings): `OpenAI__Endpoint`, `OpenAI__Key`, `OpenAI__ModelName`, `Google__ClientId`, `Google__ClientSecret`, and optionally `FrontendUrl`, `AllowedOrigins`.

### Local development (user secrets)

Use **user secrets** so credentials are not in the repo:

```bash
# From the project folder (where the .csproj is)
dotnet user-secrets set "OpenAI:Endpoint" "https://your-resource.openai.azure.com/"
dotnet user-secrets set "OpenAI:Key" "your-api-key"
dotnet user-secrets set "OpenAI:ModelName" "your-deployment-name"
dotnet user-secrets set "Google:ClientId" "your-google-client-id"
dotnet user-secrets set "Google:ClientSecret" "your-google-client-secret"
```

User secrets are loaded by the .NET configuration and override appsettings. Same key names as in Azure (use `__` for nested keys in Azure, e.g. `Google__ClientId`).
