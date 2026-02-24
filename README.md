# OpenAIService

React frontend (ClientApp) + .NET backend. Chat UI calls Azure OpenAI via the backend. Sign-in is via Google OAuth; the chat API is protected and requires an authenticated user.

## Configuration

### Azure OpenAI (chat)

The backend needs **OpenAI:Endpoint**, **OpenAI:Key**, **OpenAI:ModelName** for Azure OpenAI.

### Azure Blob Storage (data and allowed users)

The backend uses Azure Blob Storage for chats, memory, error logs, and to determine which users are allowed after Google sign-in. Configure (for local development, use **user secrets** as recommended below):

- **AzureStorage:AccountName** — Storage account name (e.g. `mystorageaccount`).
- **AzureStorage:AccountKey** — Storage account access key (primary or secondary).
- **AzureStorage:ContainerName** — Blob container name (e.g. `trmopenaiservice`).

User blobs must already exist; the app does not create them. Create a block blob per allowed user at path `Users/<SanitizedEmail>.json` (email is sanitized for blob paths; blob names end with `.json`). Blob content is JSON, for example:

```json
{
  "email": "user@example.com",
  "isEnabled": true,
  "creationDate": "2026-02-15T17:14:57.39Z",
  "lastLoginDate": "2026-02-23T08:20:00.353Z"
}
```

### Google OAuth (sign-in)

The backend needs **Google:ClientId** and **Google:ClientSecret** from [Google Cloud Console](https://console.cloud.google.com) (OAuth 2.0 Client ID, Web application).

Register the **Authorized redirect URI** in Google: `https://yourdomain.com/signin-google` (production) and/or `http://localhost:5031/signin-google` (local).

Optional:

- **FrontendUrl** — URL of the SPA to redirect to after Google sign-in (default in dev: `http://localhost:44489`).
- **AllowedOrigins** — Semicolon-separated list of origins for CORS (default: `http://localhost:44489`). Must include the SPA origin when it is on a different port/domain.

### Azure Web App (production)

Set all values as **Application settings** in the Azure Portal (Configuration → Application settings): `OpenAI__Endpoint`, `OpenAI__Key`, `OpenAI__ModelName`, `AzureStorage__AccountName`, `AzureStorage__AccountKey`, `AzureStorage__ContainerName`, `Google__ClientId`, `Google__ClientSecret`, and optionally `FrontendUrl`, `AllowedOrigins`.

### Local development (user secrets, recommended)

Store all secrets in **user secrets** so credentials are not in the repo:

```bash
# From the project folder (where the .csproj is)
dotnet user-secrets set "OpenAI:Endpoint" "https://your-resource.openai.azure.com/"
dotnet user-secrets set "OpenAI:Key" "your-api-key"
dotnet user-secrets set "OpenAI:ModelName" "your-deployment-name"
dotnet user-secrets set "Google:ClientId" "your-google-client-id"
dotnet user-secrets set "Google:ClientSecret" "your-google-client-secret"
dotnet user-secrets set "AzureStorage:AccountName" "yourstorageaccount"
dotnet user-secrets set "AzureStorage:AccountKey" "your-base64-access-key"
dotnet user-secrets set "AzureStorage:ContainerName" "trmopenaiservice"
```

User secrets are loaded by the .NET configuration and override appsettings. Same key names as in Azure (use `__` for nested keys in Azure, e.g. `Google__ClientId`).
