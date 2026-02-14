# OpenAIService

React frontend (ClientApp) + .NET backend. Chat UI calls Azure OpenAI via the backend.

## Configuration (Azure OpenAI)

The backend needs three values: **Endpoint**, **OpenAIKey**, **ModelName**.

### Azure Web App (production)

Set them as **Application settings** in the Azure Portal:

1. Web App → **Configuration** → **Application settings**
2. Add: `Endpoint`, `OpenAIKey`, `ModelName` (same names as below)

They are injected as environment variables; no code or deploy change needed.

### Local development (mimics Azure)

Use **user secrets** so the same key names are read from a local store (not in the repo):

```bash
# From the project folder (where the .csproj is)
dotnet user-secrets set "Endpoint" "https://your-resource.openai.azure.com/"
dotnet user-secrets set "OpenAIKey" "your-api-key"
dotnet user-secrets set "ModelName" "your-deployment-name"
dotnet user-secrets set "Pin" "YOUR_8_CHAR_PIN"
```

**Pin** must be exactly 8 alphanumeric characters (0–9, A–Z, a–z). The app shows a PIN dialog at startup; on success the chat is available, on failure it redirects to chatgpt.com. The PIN is also required on every API request (e.g. chat).

User secrets are loaded by the .NET configuration and override appsettings. Same keys as in Azure, so behavior matches. In Azure Web App, set **Pin** in Application settings as well.
